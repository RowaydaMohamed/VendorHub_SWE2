package com.vendorhub.product.service;

import com.vendorhub.product.dto.CategoryDTOs.CategoryResponse;
import com.vendorhub.product.dto.ProductDTOs.*;
import com.vendorhub.product.entity.Category;
import com.vendorhub.product.entity.Product;
import com.vendorhub.product.entity.ProductReview;
import com.vendorhub.product.event.ProductEvents.*;
import com.vendorhub.product.kafka.ProductEventProducer;
import com.vendorhub.product.repository.CategoryRepository;
import com.vendorhub.product.repository.ProductRepository;
import com.vendorhub.product.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository       productRepository;
    private final CategoryRepository      categoryRepository;
    private final ProductReviewRepository reviewRepository;
    private final ProductEventProducer    eventProducer;

    private static final String UPLOAD_DIR       = "/app/uploads/";
    private static final int    LOW_STOCK_THRESH = 5;

    // ── Public browsing ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getApprovedProducts(int page, int size, String sort) {
        Pageable p = PageRequest.of(page, size, parseSort(sort));
        return toPagedResponse(
            productRepository.findByApprovalStatusAndActiveTrue(Product.ApprovalStatus.APPROVED, p));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(String query, int page, int size) {
        return toPagedResponse(
            productRepository.searchApproved(query, PageRequest.of(page, size)));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProductsByCategory(Long categoryId, int page, int size) {
        return toPagedResponse(
            productRepository.findApprovedByCategory(categoryId, PageRequest.of(page, size)));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProductsByPriceRange(BigDecimal min, BigDecimal max, int page, int size) {
        return toPagedResponse(
            productRepository.findApprovedByPriceRange(min, max, PageRequest.of(page, size)));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return ProductResponse.from(productRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id)));
    }

    // ── Vendor operations ─────────────────────────────────────────

    public ProductResponse createProduct(Long vendorId, String vendorEmail, CreateProductRequest req) {
        Category category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId()).orElse(null);
        }
        Product product = Product.builder()
            .name(req.getName())
            .description(req.getDescription())
            .price(req.getPrice())
            .stockQuantity(req.getStockQuantity())
            .brand(req.getBrand())
            .category(category)
            .vendorId(vendorId)
            .vendorEmail(vendorEmail)
            .approvalStatus(Product.ApprovalStatus.PENDING)
            .active(true)
            .averageRating(0.0)
            .totalReviews(0)
            .build();
        return ProductResponse.from(productRepository.save(product));
    }

    public String uploadProductImage(Long productId, Long vendorId, MultipartFile file) throws IOException {
        Product product = getVendorProduct(productId, vendorId);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path dir = Paths.get(UPLOAD_DIR);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        String url = "/uploads/" + filename;
        product.setImageUrl(url);
        productRepository.save(product);
        return url;
    }

    public ProductResponse updateProduct(Long productId, Long vendorId, UpdateProductRequest req) {
        Product product = getVendorProduct(productId, vendorId);
        int oldStock = product.getStockQuantity();

        if (req.getName()        != null) product.setName(req.getName());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getPrice()       != null) product.setPrice(req.getPrice());
        if (req.getStockQuantity() != null) product.setStockQuantity(req.getStockQuantity());
        if (req.getBrand()       != null) product.setBrand(req.getBrand());
        if (req.getActive()      != null) product.setActive(req.getActive());
        if (req.getCategoryId()  != null) {
            categoryRepository.findById(req.getCategoryId()).ifPresent(product::setCategory);
        }

        Product saved = productRepository.save(product);

        if (req.getStockQuantity() != null
                && saved.getStockQuantity() <= LOW_STOCK_THRESH
                && oldStock > LOW_STOCK_THRESH) {
            publishLowStock(saved);
        }
        return ProductResponse.from(saved);
    }

    public void deleteVendorProduct(Long productId, Long vendorId) {
        Product p = getVendorProduct(productId, vendorId);
        p.setActive(false);
        productRepository.save(p);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getVendorProducts(Long vendorId) {
        return productRepository.findByVendorId(vendorId)
            .stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getVendorLowStockProducts(Long vendorId) {
        return productRepository.findLowStockByVendor(vendorId, LOW_STOCK_THRESH)
            .stream().map(ProductResponse::from).toList();
    }

    // ── Admin operations ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getAllProducts(String status, int page, int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> products = (status != null)
            ? productRepository.findByApprovalStatus(
                Product.ApprovalStatus.valueOf(status.toUpperCase()), p)
            : productRepository.findAll(p);
        return toPagedResponse(products);
    }

    public ProductResponse approveProduct(Long productId, boolean approve) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        product.setApprovalStatus(approve
            ? Product.ApprovalStatus.APPROVED
            : Product.ApprovalStatus.REJECTED);
        Product saved = productRepository.save(product);

        try {
            eventProducer.publishProductApproved(ProductApprovedEvent.builder()
                .productId(saved.getId())
                .productName(saved.getName())
                .vendorId(saved.getVendorId())
                .vendorEmail(saved.getVendorEmail())
                .approved(approve)
                .processedAt(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            log.warn("Kafka ProductApprovedEvent failed: {}", e.getMessage());
        }
        return ProductResponse.from(saved);
    }

    public void adminDeleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        product.setActive(false);
        product.setApprovalStatus(Product.ApprovalStatus.REJECTED);
        productRepository.save(product);
    }

    // ── Internal: called by order-service via Feign ───────────────

    public void reduceStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        if (product.getStockQuantity() < quantity) {
            throw new IllegalStateException(
                "Insufficient stock for product: " + product.getName());
        }
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);

        if (product.getStockQuantity() <= LOW_STOCK_THRESH) {
            publishLowStock(product);
        }
    }

    // ── Reviews ───────────────────────────────────────────────────

    public ReviewResponse addReview(Long productId, Long customerId,
                                    String customerName, ReviewRequest req) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        if (product.getApprovalStatus() != Product.ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Cannot review an unapproved product");
        }
        if (reviewRepository.findByProductIdAndCustomerId(productId, customerId).isPresent()) {
            throw new IllegalStateException("You have already reviewed this product");
        }
        ProductReview review = ProductReview.builder()
            .product(product)
            .customerId(customerId)
            .customerName(customerName)
            .rating(req.getRating())
            .comment(req.getComment())
            .build();
        reviewRepository.save(review);

        Double avg   = reviewRepository.findAverageRatingByProductId(productId);
        long   count = reviewRepository.countByProductId(productId);
        product.setAverageRating(avg != null ? avg : 0.0);
        product.setTotalReviews((int) count);
        productRepository.save(product);
        return ReviewResponse.from(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId)
            .stream().map(ReviewResponse::from).toList();
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Product getVendorProduct(Long productId, Long vendorId) {
        Product p = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        if (!p.getVendorId().equals(vendorId)) {
            throw new SecurityException("Access denied: product does not belong to this vendor");
        }
        return p;
    }

    private void publishLowStock(Product p) {
        try {
            eventProducer.publishProductOutOfStock(ProductOutOfStockEvent.builder()
                .productId(p.getId())
                .productName(p.getName())
                .vendorId(p.getVendorId())
                .vendorEmail(p.getVendorEmail())
                .currentStock(p.getStockQuantity())
                .occurredAt(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            log.warn("Kafka LowStockEvent failed: {}", e.getMessage());
        }
    }

    private PagedResponse<ProductResponse> toPagedResponse(Page<Product> page) {
        PagedResponse<ProductResponse> r = new PagedResponse<>();
        r.setContent(page.getContent().stream().map(ProductResponse::from).toList());
        r.setPage(page.getNumber());
        r.setSize(page.getSize());
        r.setTotalElements(page.getTotalElements());
        r.setTotalPages(page.getTotalPages());
        return r;
    }

    private Sort parseSort(String sort) {
        if (sort == null) return Sort.by("createdAt").descending();
        return switch (sort) {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating"     -> Sort.by("averageRating").descending();
            default           -> Sort.by("createdAt").descending();
        };
    }
}