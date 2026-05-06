package com.vendorhub.notification.service;

import com.vendorhub.notification.dto.NotificationDTOs.*;
import com.vendorhub.notification.entity.Notification;
import com.vendorhub.notification.entity.Notification.NotificationType;
import com.vendorhub.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    /**
     * Persist a notification to DB (appears on recipient's dashboard)
     * and optionally send an email.
     */
    public Notification createAndSend(Long recipientId,
                                       String recipientEmail,
                                       NotificationType type,
                                       String title,
                                       String message,
                                       Long referenceId,
                                       String referenceType,
                                       boolean sendEmail) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .recipientEmail(recipientEmail)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("[NOTIFICATION] Created: type={} recipientId={}", type, recipientId);

        if (sendEmail && recipientEmail != null && !recipientEmail.isBlank()) {
            emailService.send(recipientEmail, title, message);
        }

        return saved;
    }

    // ── Event Handlers ────────────────────────────────────────────

    public void handleVendorApproved(Long vendorId, String vendorEmail,
                                      String firstName, String businessName, boolean approved) {
        String title = approved
            ? "Your vendor account has been approved!"
            : "Vendor application update";

        String message = approved
            ? String.format("Hi %s, great news! Your vendor account for \"%s\" has been approved. " +
                            "You can now log in and start adding products.", firstName, businessName)
            : String.format("Hi %s, unfortunately your vendor application for \"%s\" was not approved. " +
                            "Please contact support for more information.", firstName, businessName);

        createAndSend(vendorId, vendorEmail,
                NotificationType.VENDOR_APPROVED, title, message,
                vendorId, "VENDOR", true);
    }

    public void handleProductApproved(Long vendorId, String vendorEmail,
                                       String productName, Long productId, boolean approved) {
        String title = approved
            ? "Product approved: " + productName
            : "Product not approved: " + productName;

        String message = approved
            ? String.format("Your product \"%s\" has been approved and is now live on VendorHub.", productName)
            : String.format("Your product \"%s\" was not approved by our admin team. " +
                            "Please review our product guidelines and resubmit.", productName);

        createAndSend(vendorId, vendorEmail,
                NotificationType.PRODUCT_APPROVED, title, message,
                productId, "PRODUCT", true);
    }

    public void handleOrderPlaced(Long vendorId, String vendorEmail,
                                   String orderNumber, String customerEmail,
                                   String productName, int quantity,
                                   java.math.BigDecimal subtotal, Long orderId) {
        String title = "New order received! Order #" + orderNumber;
        String message = String.format(
            "You have a new order!\n\n" +
            "Order #: %s\n" +
            "Product: %s\n" +
            "Quantity: %d\n" +
            "Subtotal: $%.2f\n" +
            "Customer: %s\n\n" +
            "Log in to your dashboard to manage this order.",
            orderNumber, productName, quantity, subtotal, customerEmail
        );

        createAndSend(vendorId, vendorEmail,
                NotificationType.ORDER_PLACED, title, message,
                orderId, "ORDER", true);
    }

    public void handleLowStock(Long vendorId, String vendorEmail,
                                String productName, Long productId, int currentStock) {
        String title = "Low stock alert: " + productName;
        String message = String.format(
            "Your product \"%s\" is running low on stock.\n" +
            "Current stock: %d unit(s).\n\n" +
            "Please restock soon to avoid missing sales.",
            productName, currentStock
        );

        createAndSend(vendorId, vendorEmail,
                NotificationType.LOW_STOCK, title, message,
                productId, "PRODUCT", true);
    }

    // ── Dashboard Queries ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(Long recipientId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId)
                .stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long recipientId) {
        return notificationRepository
                .findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(recipientId)
                .stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
    }

    public void markAllRead(Long recipientId) {
        notificationRepository.markAllReadByRecipient(recipientId);
    }

    public void markOneRead(Long notificationId, Long recipientId) {
        notificationRepository.markOneRead(notificationId, recipientId);
    }
}