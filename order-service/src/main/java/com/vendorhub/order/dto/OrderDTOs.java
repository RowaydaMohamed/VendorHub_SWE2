package com.vendorhub.order.dto;

import com.vendorhub.order.entity.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTOs {

    // ─── Cart ─────────────────────────────────────────────────

    @Data
    public static class AddToCartRequest {
        @NotNull private Long productId;
        @NotNull @Min(1) private Integer quantity;
        private String productName;
        private String productImageUrl;
        private BigDecimal unitPrice;
        private Long vendorId;
        private String vendorEmail;
    }

    @Data
    public static class UpdateCartItemRequest {
        @NotNull @Min(1) private Integer quantity;
    }

    @Data
    public static class CartResponse {
        private Long id;
        private Long customerId;
        private List<CartItemResponse> items;
        private BigDecimal totalAmount;

        public static CartResponse from(Cart cart) {
            CartResponse r = new CartResponse();
            r.setId(cart.getId());
            r.setCustomerId(cart.getCustomerId());
            r.setItems(cart.getItems().stream().map(CartItemResponse::from).toList());
            r.setTotalAmount(cart.getItems().stream()
                    .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            return r;
        }
    }

    @Data
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private Long vendorId;

        public static CartItemResponse from(CartItem item) {
            CartItemResponse r = new CartItemResponse();
            r.setId(item.getId());
            r.setProductId(item.getProductId());
            r.setProductName(item.getProductName());
            r.setProductImageUrl(item.getProductImageUrl());
            r.setUnitPrice(item.getUnitPrice());
            r.setQuantity(item.getQuantity());
            r.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            r.setVendorId(item.getVendorId());
            return r;
        }
    }

    // ─── Order ────────────────────────────────────────────────

    @Data
    public static class PlaceOrderRequest {
        @NotBlank private String shippingAddress;
        @NotBlank private String shippingCity;
        @NotBlank private String shippingCountry;
        @NotBlank private String shippingPostalCode;
        @NotNull  private Order.PaymentMethod paymentMethod;
    }

    @Data
    public static class OrderResponse {
        private Long id;
        private String orderNumber;
        private Long customerId;
        private String customerEmail;
        private List<OrderItemResponse> items;
        private BigDecimal totalAmount;
        private Order.OrderStatus status;
        private Order.PaymentMethod paymentMethod;
        private Order.PaymentStatus paymentStatus;
        private String shippingAddress;
        private String shippingCity;
        private String shippingCountry;
        private LocalDateTime createdAt;

        public static OrderResponse from(Order order) {
            OrderResponse r = new OrderResponse();
            r.setId(order.getId());
            r.setOrderNumber(order.getOrderNumber());
            r.setCustomerId(order.getCustomerId());
            r.setCustomerEmail(order.getCustomerEmail());
            r.setItems(order.getItems().stream().map(OrderItemResponse::from).toList());
            r.setTotalAmount(order.getTotalAmount());
            r.setStatus(order.getStatus());
            r.setPaymentMethod(order.getPaymentMethod());
            r.setPaymentStatus(order.getPaymentStatus());
            r.setShippingAddress(order.getShippingAddress());
            r.setShippingCity(order.getShippingCity());
            r.setShippingCountry(order.getShippingCountry());
            r.setCreatedAt(order.getCreatedAt());
            return r;
        }
    }

    @Data
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private String productImageUrl;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private Long vendorId;

        public static OrderItemResponse from(OrderItem item) {
            OrderItemResponse r = new OrderItemResponse();
            r.setProductId(item.getProductId());
            r.setProductName(item.getProductName());
            r.setProductImageUrl(item.getProductImageUrl());
            r.setUnitPrice(item.getUnitPrice());
            r.setQuantity(item.getQuantity());
            r.setSubtotal(item.getSubtotal());
            r.setVendorId(item.getVendorId());
            return r;
        }
    }

    // ─── Favorites ────────────────────────────────────────────

    @Data
    public static class FavoriteResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private String productPrice;
        private LocalDateTime addedAt;

        public static FavoriteResponse from(Favorite f) {
            FavoriteResponse r = new FavoriteResponse();
            r.setId(f.getId());
            r.setProductId(f.getProductId());
            r.setProductName(f.getProductName());
            r.setProductImageUrl(f.getProductImageUrl());
            r.setProductPrice(f.getProductPrice());
            r.setAddedAt(f.getAddedAt());
            return r;
        }
    }

    @Data
    public static class AddFavoriteRequest {
        @NotNull private Long productId;
        private String productName;
        private String productImageUrl;
        private String productPrice;
    }

    @Data
    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
    }
}