package com.vendorhub.product.service;

import com.vendorhub.product.dto.*;
import com.vendorhub.product.model.*;
import com.vendorhub.product.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;

    // ── Vendor operations ──────────────────────────────────────
    public ProductDto createProduct(ProductRequest request, Long vendorId) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .vendorId(vendorId)
                .status(ProductStatus.PENDING)
                .build();
        return toDto(productRepository.save(product));
    }

    public ProductDto updateProduct(Long productId, ProductRequest request, Long vendorId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getVendorId().equals(vendorId)) {
            throw new RuntimeException("Unauthorized");
        }
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());
        return toDto(productRepository.save(product));
    }

    public void deleteProduct(Long productId, Long vendorId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getVendorId().equals(vendorId)) {
            throw new RuntimeException("Unauthorized");
        }
        productRepository.delete(product);
    }

    public List<ProductDto> getVendorProducts(Long vendorId) {
        return productRepository.findByVendorId(vendorId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── Admin operations ───────────────────────────────────────
    public List<ProductDto> getPendingProducts() {
        return productRepository.findByStatus(ProductStatus.PENDING)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProductDto approveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(ProductStatus.APPROVED);
        return toDto(productRepository.save(product));
    }

    public ProductDto rejectProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(ProductStatus.REJECTED);
        return toDto(productRepository.save(product));
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── Customer / public operations ───────────────────────────
    public List<ProductDto> getApprovedProducts() {
        return productRepository.findByStatus(ProductStatus.APPROVED)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> searchProducts(String keyword) {
        return productRepository
                .findByNameContainingIgnoreCaseAndStatus(keyword, ProductStatus.APPROVED)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> getByCategory(String category) {
        return productRepository
                .findByStatusAndCategory(ProductStatus.APPROVED, category)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        return toDto(productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found")));
    }

    // ── Favorites ──────────────────────────────────────────────
    public void addFavorite(Long userId, Long productId) {
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Already in favorites");
        }
        favoriteRepository.save(Favorite.builder()
                .userId(userId).productId(productId).build());
    }

    public void removeFavorite(Long userId, Long productId) {
        Favorite fav = favoriteRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));
        favoriteRepository.delete(fav);
    }

    public List<ProductDto> getFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(f -> productRepository.findById(f.getProductId()).orElse(null))
                .filter(p -> p != null)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Reviews ────────────────────────────────────────────────
    public ReviewDto addReview(Long productId, Long userId,
                               String userName, ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Already reviewed this product");
        }
        Review review = Review.builder()
                .productId(productId)
                .userId(userId)
                .userName(userName)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        return toReviewDto(reviewRepository.save(review));
    }

    public List<ReviewDto> getReviews(Long productId) {
        return reviewRepository.findByProductId(productId)
                .stream().map(this::toReviewDto).collect(Collectors.toList());
    }

    // ── Mappers ────────────────────────────────────────────────
    private ProductDto toDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .category(p.getCategory())
                .vendorId(p.getVendorId())
                .status(p.getStatus().name())
                .build();
    }

    private ReviewDto toReviewDto(Review r) {
        return ReviewDto.builder()
                .id(r.getId())
                .productId(r.getProductId())
                .userId(r.getUserId())
                .userName(r.getUserName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}