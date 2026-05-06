package com.vendorhub.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who receives this notification (userId from auth-service)
    @Column(nullable = false)
    private Long recipientId;

    // Recipient's email (for display)
    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    // Optional reference to the related entity (orderId, productId, etc.)
    private Long referenceId;

    private String referenceType; // "ORDER", "PRODUCT", "VENDOR"

    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum NotificationType {
        ORDER_PLACED,           // sent to vendor when a customer places an order
        PRODUCT_APPROVED,       // sent to vendor when admin approves/rejects product
        VENDOR_APPROVED,        // sent to vendor when admin approves/rejects account
        LOW_STOCK,              // sent to vendor when stock is low
        ORDER_STATUS_UPDATED,   // sent to customer when order status changes
        GENERAL
    }
}