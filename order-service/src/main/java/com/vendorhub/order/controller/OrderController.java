package com.vendorhub.order.controller;

import com.vendorhub.order.dto.*;
import com.vendorhub.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication auth) {
        Long customerId = (Long) auth.getCredentials();
        return ResponseEntity.ok(orderService.createOrder(request, customerId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderDto>> myOrders(Authentication auth) {
        Long customerId = (Long) auth.getCredentials();
        return ResponseEntity.ok(orderService.getMyOrders(customerId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> getOrder(@PathVariable Long id,
                                              Authentication auth) {
        Long customerId = (Long) auth.getCredentials();
        return ResponseEntity.ok(orderService.getOrderById(id, customerId));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto> cancelOrder(@PathVariable Long id,
                                                 Authentication auth) {
        Long customerId = (Long) auth.getCredentials();
        return ResponseEntity.ok(orderService.cancelOrder(id, customerId));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> allOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> updateStatus(@PathVariable Long id,
                                                  @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}