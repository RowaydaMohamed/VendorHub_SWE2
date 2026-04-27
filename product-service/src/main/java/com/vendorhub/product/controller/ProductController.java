package com.vendorhub.product.controller;

import com.vendorhub.product.dto.*;
import com.vendorhub.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // Public
    @GetMapping("/approved")
    public ResponseEntity<List<ProductDto>> getApproved() {
        return ResponseEntity.ok(productService.getApprovedProducts());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    @GetMapping("/category")
    public ResponseEntity<List<ProductDto>> byCategory(@RequestParam String category) {
        return ResponseEntity.ok(productService.getByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Vendor
    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ProductDto> create(@Valid @RequestBody ProductRequest request,
                                              Authentication auth) {
        Long vendorId = (Long) auth.getCredentials();
        return ResponseEntity.ok(productService.createProduct(request, vendorId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ProductDto> update(@PathVariable Long id,
                                              @Valid @RequestBody ProductRequest request,
                                              Authentication auth) {
        Long vendorId = (Long) auth.getCredentials();
        return ResponseEntity.ok(productService.updateProduct(id, request, vendorId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        Long vendorId = (Long) auth.getCredentials();
        productService.deleteProduct(id, vendorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vendor/my")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<ProductDto>> myProducts(Authentication auth) {
        Long vendorId = (Long) auth.getCredentials();
        return ResponseEntity.ok(productService.getVendorProducts(vendorId));
    }

    // Admin
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDto>> allProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDto>> pending() {
        return ResponseEntity.ok(productService.getPendingProducts());
    }

    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> approve(@PathVariable Long id) {
        return ResponseEntity.ok(productService.approveProduct(id));
    }

    @PutMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> reject(@PathVariable Long id) {
        return ResponseEntity.ok(productService.rejectProduct(id));
    }
}