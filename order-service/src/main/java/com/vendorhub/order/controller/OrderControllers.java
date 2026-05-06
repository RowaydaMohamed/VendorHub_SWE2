package com.vendorhub.order.controller;

import com.vendorhub.order.dto.OrderDTOs.*;
import com.vendorhub.order.entity.Order;
import com.vendorhub.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ─── Cart Controller ──────────────────────────────────────────────

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
class CartController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(orderService.getCart(Long.parseLong(userIdStr)));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @RequestHeader("X-User-Id") String userIdStr,
            @Valid @RequestBody AddToCartRequest req) {
        return ResponseEntity.ok(orderService.addToCart(Long.parseLong(userIdStr), req));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest req) {
        return ResponseEntity.ok(orderService.updateCartItem(Long.parseLong(userIdStr), itemId, req));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(orderService.removeFromCart(Long.parseLong(userIdStr), itemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<CartResponse> clearCart(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(orderService.clearCart(Long.parseLong(userIdStr)));
    }
}

// ─── Customer Order Controller ────────────────────────────────────

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @RequestHeader("X-User-Id")   String userIdStr,
            @RequestHeader("X-User-Name") String customerEmail,
            @Valid @RequestBody PlaceOrderRequest req) {
        return ResponseEntity.ok(orderService.placeOrder(Long.parseLong(userIdStr), customerEmail, req));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(orderService.getMyOrders(Long.parseLong(userIdStr)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(orderService.getOrderById(id, Long.parseLong(userIdStr)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(orderService.cancelOrder(id, Long.parseLong(userIdStr)));
    }
}

// ─── Admin Order Controller ───────────────────────────────────────

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}

// ─── Vendor Order Controller ──────────────────────────────────────

@RestController
@RequestMapping("/api/vendor/orders")
@RequiredArgsConstructor
class VendorOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getVendorOrders(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(orderService.getVendorOrders(Long.parseLong(userIdStr)));
    }
}

// ─── Favorites Controller ─────────────────────────────────────────

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
class FavoritesController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<FavoriteResponse>> getFavorites(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(orderService.getFavorites(Long.parseLong(userIdStr)));
    }

    @PostMapping
    public ResponseEntity<FavoriteResponse> addFavorite(
            @RequestHeader("X-User-Id") String userIdStr,
            @Valid @RequestBody AddFavoriteRequest req) {
        return ResponseEntity.ok(orderService.addFavorite(Long.parseLong(userIdStr), req));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<MessageResponse> removeFavorite(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable Long productId) {
        orderService.removeFavorite(Long.parseLong(userIdStr), productId);
        return ResponseEntity.ok(new MessageResponse("Removed from favorites"));
    }
}