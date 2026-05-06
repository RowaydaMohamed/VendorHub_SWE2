package com.vendorhub.product.event;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductEvents {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductApprovedEvent {
        private Long productId;
        private String productName;
        private Long vendorId;
        private String vendorEmail;
        private boolean approved;
        private LocalDateTime processedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductOutOfStockEvent {
        private Long productId;
        private String productName;
        private Long vendorId;
        private String vendorEmail;
        private int currentStock;
        private LocalDateTime occurredAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StockUpdatedEvent {
        private Long productId;
        private int newStock;
        private LocalDateTime updatedAt;
    }
}