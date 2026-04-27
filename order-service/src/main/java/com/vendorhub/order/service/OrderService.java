package com.vendorhub.order.service;

import com.vendorhub.order.dto.*;
import com.vendorhub.order.model.*;
import com.vendorhub.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderDto createOrder(OrderRequest request, Long customerId) {
        List<OrderItem> items = request.getItems().stream()
                .map(i -> OrderItem.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        double total = items.stream()
                .mapToDouble(i -> i.getUnitPrice() * i.getQuantity())
                .sum();

        Order order = Order.builder()
                .customerId(customerId)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .build();

        Order saved = orderRepository.save(order);
        items.forEach(i -> i.setOrder(saved));
        saved.setItems(items);
        Order final_ = orderRepository.save(saved);

        return toDto(final_);
    }

    public List<OrderDto> getMyOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto getOrderById(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Unauthorized");
        }
        return toDto(order);
    }

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        return toDto(orderRepository.save(order));
    }

    public OrderDto cancelOrder(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }
        order.setStatus(OrderStatus.CANCELLED);
        return toDto(orderRepository.save(order));
    }

    private OrderDto toDto(Order o) {
        List<OrderItemDto> itemDtos = o.getItems() == null ? List.of() :
                o.getItems().stream().map(i -> OrderItemDto.builder()
                        .id(i.getId())
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getUnitPrice() * i.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(o.getId())
                .customerId(o.getCustomerId())
                .status(o.getStatus().name())
                .totalAmount(o.getTotalAmount())
                .createdAt(o.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}