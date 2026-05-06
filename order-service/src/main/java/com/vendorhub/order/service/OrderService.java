package com.vendorhub.order.service;

import com.vendorhub.order.client.ProductServiceClient;
import com.vendorhub.order.dto.OrderDTOs.*;
import com.vendorhub.order.entity.*;
import com.vendorhub.order.event.OrderPlacedEvent;
import com.vendorhub.order.kafka.OrderEventProducer;
import com.vendorhub.order.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final FavoriteRepository favoriteRepository;
    private final OrderEventProducer eventProducer;
    private final ProductServiceClient productServiceClient;

    // ─── Cart Operations ─────────────────────────────────────

    public CartResponse getCart(Long customerId) {
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> cartRepository.save(Cart.builder().customerId(customerId).build()));
        return CartResponse.from(cart);
    }

    public CartResponse addToCart(Long customerId, AddToCartRequest req) {
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> cartRepository.save(Cart.builder().customerId(customerId).build()));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(req.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + req.getQuantity());
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .productId(req.getProductId())
                    .productName(req.getProductName())
                    .productImageUrl(req.getProductImageUrl())
                    .unitPrice(req.getUnitPrice())
                    .quantity(req.getQuantity())
                    .vendorId(req.getVendorId())
                    .vendorEmail(req.getVendorEmail())
                    .build();
            cart.getItems().add(item);
        }

        return CartResponse.from(cartRepository.save(cart));
    }

    public CartResponse updateCartItem(Long customerId, Long cartItemId, UpdateCartItemRequest req) {
        Cart cart = getCartOrThrow(customerId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        item.setQuantity(req.getQuantity());
        return CartResponse.from(cartRepository.save(cart));
    }

    public CartResponse removeFromCart(Long customerId, Long cartItemId) {
        Cart cart = getCartOrThrow(customerId);
        cart.getItems().removeIf(i -> i.getId().equals(cartItemId));
        return CartResponse.from(cartRepository.save(cart));
    }

    public CartResponse clearCart(Long customerId) {
        Cart cart = getCartOrThrow(customerId);
        cart.getItems().clear();
        return CartResponse.from(cartRepository.save(cart));
    }

    // ─── Order Placement ─────────────────────────────────────

    public OrderResponse placeOrder(Long customerId, String customerEmail, PlaceOrderRequest req) {
        Cart cart = getCartOrThrow(customerId);

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot place order: cart is empty");
        }

        // Build order items and calculate total
        BigDecimal total = BigDecimal.ZERO;
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customerId(customerId)
                .customerEmail(customerEmail)
                .status(Order.OrderStatus.CONFIRMED)
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(req.getPaymentMethod() == Order.PaymentMethod.CASH_ON_DELIVERY
                        ? Order.PaymentStatus.PENDING : Order.PaymentStatus.PAID)
                .shippingAddress(req.getShippingAddress())
                .shippingCity(req.getShippingCity())
                .shippingCountry(req.getShippingCountry())
                .shippingPostalCode(req.getShippingPostalCode())
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (CartItem cartItem : cart.getItems()) {
            BigDecimal subtotal = cartItem.getUnitPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(cartItem.getProductId())
                    .productName(cartItem.getProductName())
                    .productImageUrl(cartItem.getProductImageUrl())
                    .unitPrice(cartItem.getUnitPrice())
                    .quantity(cartItem.getQuantity())
                    .subtotal(subtotal)
                    .vendorId(cartItem.getVendorId())
                    .vendorEmail(cartItem.getVendorEmail())
                    .build();
            order.getItems().add(orderItem);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        // Reduce stock for each product via Feign
        for (CartItem cartItem : cart.getItems()) {
            try {
                productServiceClient.reduceStock(cartItem.getProductId(), cartItem.getQuantity());
            } catch (Exception e) {
                log.error("Failed to reduce stock for product {}: {}", cartItem.getProductId(), e.getMessage());
                // Don't fail the order, log and continue (can add compensation logic)
            }
        }

        // Publish OrderPlaced event
        List<OrderPlacedEvent.OrderItemEvent> itemEvents = savedOrder.getItems().stream()
                .map(i -> OrderPlacedEvent.OrderItemEvent.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .vendorId(i.getVendorId())
                        .vendorEmail(i.getVendorEmail())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build())
                .toList();

        eventProducer.publishOrderPlaced(OrderPlacedEvent.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .customerId(customerId)
                .customerEmail(customerEmail)
                .totalAmount(total)
                .paymentMethod(req.getPaymentMethod().name())
                .items(itemEvents)
                .placedAt(LocalDateTime.now())
                .build());

        // Clear cart after successful order
        cart.getItems().clear();
        cartRepository.save(cart);

        return OrderResponse.from(savedOrder);
    }

    // ─── Order History ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getCustomerId().equals(customerId)) {
            throw new SecurityException("Access denied");
        }
        return OrderResponse.from(order);
    }

    public OrderResponse cancelOrder(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getCustomerId().equals(customerId)) {
            throw new SecurityException("Access denied");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order cannot be cancelled at this stage");
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        return OrderResponse.from(orderRepository.save(order));
    }

    // ─── Admin Order Management ───────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(OrderResponse::from).toList();
    }

    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(status);
        return OrderResponse.from(orderRepository.save(order));
    }

    // ─── Vendor Order View ────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getVendorOrders(Long vendorId) {
        // Filter orders containing this vendor's items
        return orderRepository.findAll().stream()
                .filter(o -> o.getItems().stream().anyMatch(i -> i.getVendorId() != null
                        && i.getVendorId().equals(vendorId)))
                .map(OrderResponse::from)
                .toList();
    }

    // ─── Favorites ────────────────────────────────────────────

    public FavoriteResponse addFavorite(Long customerId, AddFavoriteRequest req) {
        if (favoriteRepository.existsByCustomerIdAndProductId(customerId, req.getProductId())) {
            throw new IllegalStateException("Product already in favorites");
        }
        Favorite favorite = Favorite.builder()
                .customerId(customerId)
                .productId(req.getProductId())
                .productName(req.getProductName())
                .productImageUrl(req.getProductImageUrl())
                .productPrice(req.getProductPrice())
                .build();
        return FavoriteResponse.from(favoriteRepository.save(favorite));
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> getFavorites(Long customerId) {
        return favoriteRepository.findByCustomerId(customerId)
                .stream().map(FavoriteResponse::from).toList();
    }

    public void removeFavorite(Long customerId, Long productId) {
        favoriteRepository.deleteByCustomerIdAndProductId(customerId, productId);
    }

    // ─── Helpers ─────────────────────────────────────────────

    private Cart getCartOrThrow(Long customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new IllegalStateException("Cart not found"));
    }

    private String generateOrderNumber() {
        String timestamp = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + timestamp + "-" + random;
    }
}