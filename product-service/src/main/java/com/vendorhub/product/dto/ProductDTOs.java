package com.vendorhub.product.dto;

import com.vendorhub.product.dto.CategoryDTOs.CategoryResponse;
import com.vendorhub.product.entity.Product;
import com.vendorhub.product.entity.ProductReview;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDTOs {

    @Data
    public static class CreateProductRequest {
        @NotBlank
        private String name;
        private String description;
        @NotNull @DecimalMin("0.01")
        private BigDecimal price;
        @NotNull @Min(0)
        private Integer stockQuantity;
        private String brand;
        private Long categoryId;
    }

    @Data
    public static class UpdateProductRequest {
        private String name;
        private String description;
        @DecimalMin("0.01")
        private BigDecimal price;
        @Min(0)
        private Integer stockQuantity;
        private String brand;
        private Long categoryId;
        private Boolean active;
    }

    @Data
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stockQuantity;
        private String brand;
        private String imageUrl;
        private CategoryResponse category;   // uses CategoryDTOs.CategoryResponse
        private Long vendorId;
        private String vendorEmail;
        private Product.ApprovalStatus approvalStatus;
        private Boolean active;
        private Double averageRating;
        private Integer totalReviews;
        private LocalDateTime createdAt;

        public static ProductResponse from(Product p) {
            ProductResponse r = new ProductResponse();
            r.setId(p.getId());
            r.setName(p.getName());
            r.setDescription(p.getDescription());
            r.setPrice(p.getPrice());
            r.setStockQuantity(p.getStockQuantity());
            r.setBrand(p.getBrand());
            r.setImageUrl(p.getImageUrl());
            r.setVendorId(p.getVendorId());
            r.setVendorEmail(p.getVendorEmail());
            r.setApprovalStatus(p.getApprovalStatus());
            r.setActive(p.getActive());
            r.setAverageRating(p.getAverageRating());
            r.setTotalReviews(p.getTotalReviews());
            r.setCreatedAt(p.getCreatedAt());
            if (p.getCategory() != null) {
                r.setCategory(new CategoryResponse(
                    p.getCategory().getId(),
                    p.getCategory().getName()
                ));
            }
            return r;
        }
    }

    @Data
    public static class ReviewRequest {
        @NotNull @Min(1) @Max(5)
        private Integer rating;
        private String comment;
    }

    @Data
    public static class ReviewResponse {
        private Long id;
        private Long productId;
        private Long customerId;
        private String customerName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;

        public static ReviewResponse from(ProductReview r) {
            ReviewResponse dto = new ReviewResponse();
            dto.setId(r.getId());
            dto.setProductId(r.getProduct().getId());
            dto.setCustomerId(r.getCustomerId());
            dto.setCustomerName(r.getCustomerName());
            dto.setRating(r.getRating());
            dto.setComment(r.getComment());
            dto.setCreatedAt(r.getCreatedAt());
            return dto;
        }
    }

    @Data
    public static class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
    }

    @Data
    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
    }
}