package com.vendorhub.notification.kafka;

import com.vendorhub.notification.event.KafkaEvents.*;
import com.vendorhub.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
        topics = "vendor-approved",
        groupId = "notification-group",
        containerFactory = "vendorApprovedFactory"
    )
    public void onVendorApproved(VendorApprovedEvent event) {
        log.info("[KAFKA] VendorApprovedEvent: vendorId={} approved={}", event.getVendorId(), event.isApproved());
        try {
            notificationService.handleVendorApproved(
                    event.getVendorId(),
                    event.getEmail(),
                    event.getFirstName(),
                    event.getBusinessName(),
                    event.isApproved());
        } catch (Exception e) {
            log.error("[KAFKA] VendorApprovedEvent failed: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(
        topics = "product-approved",
        groupId = "notification-group",
        containerFactory = "productApprovedFactory"
    )
    public void onProductApproved(ProductApprovedEvent event) {
        log.info("[KAFKA] ProductApprovedEvent: productId={} approved={}", event.getProductId(), event.isApproved());
        try {
            notificationService.handleProductApproved(
                    event.getVendorId(),
                    event.getVendorEmail(),
                    event.getProductName(),
                    event.getProductId(),
                    event.isApproved());
        } catch (Exception e) {
            log.error("[KAFKA] ProductApprovedEvent failed: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(
        topics = "order-placed",
        groupId = "notification-group",
        containerFactory = "orderPlacedFactory"
    )
    public void onOrderPlaced(OrderPlacedEvent event) {
        log.info("[KAFKA] OrderPlacedEvent: orderNumber={}", event.getOrderNumber());
        try {
            // Group items by vendor so each vendor gets exactly one notification per order
            event.getItems().stream()
                .collect(Collectors.groupingBy(OrderPlacedEvent.OrderItemEvent::getVendorId))
                .forEach((vendorId, items) -> {
                    String vendorEmail = items.get(0).getVendorEmail();
                    String productSummary = items.stream()
                            .map(i -> i.getProductName() + " (x" + i.getQuantity() + ")")
                            .collect(Collectors.joining(", "));
                    int totalQty = items.stream().mapToInt(OrderPlacedEvent.OrderItemEvent::getQuantity).sum();
                    BigDecimal vendorSubtotal = items.stream()
                            .map(OrderPlacedEvent.OrderItemEvent::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    notificationService.handleOrderPlaced(
                            vendorId, vendorEmail,
                            event.getOrderNumber(), event.getCustomerEmail(),
                            productSummary, totalQty, vendorSubtotal,
                            event.getOrderId());
                });
        } catch (Exception e) {
            log.error("[KAFKA] OrderPlacedEvent failed: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(
        topics = "product-out-of-stock",
        groupId = "notification-group",
        containerFactory = "productOutOfStockFactory"
    )
    public void onProductOutOfStock(ProductOutOfStockEvent event) {
        log.info("[KAFKA] ProductOutOfStockEvent: productId={} stock={}", event.getProductId(), event.getCurrentStock());
        try {
            notificationService.handleLowStock(
                    event.getVendorId(),
                    event.getVendorEmail(),
                    event.getProductName(),
                    event.getProductId(),
                    event.getCurrentStock());
        } catch (Exception e) {
            log.error("[KAFKA] ProductOutOfStockEvent failed: {}", e.getMessage(), e);
        }
    }
}