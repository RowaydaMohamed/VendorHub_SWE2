package com.vendorhub.product.controller;

import com.vendorhub.product.dto.ProductDTOs.*;
import com.vendorhub.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    // ── Admin product management (/api/admin/products/**) ──────────

    @GetMapping("/api/admin/products")
    public ResponseEntity<PagedResponse<ProductResponse>> getAllProducts(
            @RequestParam(required = false)    String status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.getAllProducts(status, page, size));
    }

    @PatchMapping("/api/admin/products/{id}/approve")
    public ResponseEntity<ProductResponse> approveProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.approveProduct(id, true));
    }

    @PatchMapping("/api/admin/products/{id}/reject")
    public ResponseEntity<ProductResponse> rejectProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.approveProduct(id, false));
    }

    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable Long id) {
        productService.adminDeleteProduct(id);
        return ResponseEntity.ok(new MessageResponse("Product removed by admin"));
    }

    /**
     * Internal endpoint: called by order-service via Feign to reduce stock after purchase.
     * No auth headers needed — service-to-service call within the Docker network.
     */
    @PostMapping("/api/admin/products/internal/{id}/reduce-stock")
    public ResponseEntity<MessageResponse> reduceStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok(new MessageResponse("Stock updated for product " + id));
    }
}