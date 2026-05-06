package com.vendorhub.notification.event;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Mirror DTOs of all events published by other services.
 * Must match field names exactly so Kafka JSON deserialization works correctly.
 */
public class KafkaEvents {

    // ── Published by auth-service ─────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UserRegisteredEvent {
        private Long userId;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private LocalDateTime registeredAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class VendorApprovedEvent {
        private Long vendorId;
        private String email;
        private String firstName;
        private String businessName;
        private boolean approved;
        private LocalDateTime processedAt;
    }

    // ── Published by product-service ──────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ProductApprovedEvent {
        private Long productId;
        private String productName;
        private Long vendorId;
        private String vendorEmail;
        private boolean approved;
        private LocalDateTime processedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ProductOutOfStockEvent {
        private Long productId;
        private String productName;
        private Long vendorId;
        private String vendorEmail;
        private int currentStock;
        private LocalDateTime occurredAt;
    }

    // ── Published by order-service ────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class OrderPlacedEvent {
        private Long orderId;
        private String orderNumber;
        private Long customerId;
        private String customerEmail;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private List<OrderItemEvent> items;
        private LocalDateTime placedAt;

        @Data @NoArgsConstructor @AllArgsConstructor
        public static class OrderItemEvent {
            private Long productId;
            private String productName;
            private Long vendorId;
            private String vendorEmail;
            private Integer quantity;
            private BigDecimal unitPrice;
            private BigDecimal subtotal;
        }
    }
}