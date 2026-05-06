package com.vendorhub.product.controller;

import com.vendorhub.product.dto.CategoryDTOs.CategoryResponse;
import com.vendorhub.product.dto.ProductDTOs.*;
import com.vendorhub.product.service.CategoryService;
import com.vendorhub.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService  productService;
    private final CategoryService categoryService;

    // ── Public product browsing (no auth required) ────────────────

    @GetMapping("/public")
    public ResponseEntity<PagedResponse<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false)    String sort) {
        return ResponseEntity.ok(productService.getApprovedProducts(page, size, sort));
    }

    @GetMapping("/public/search")
    public ResponseEntity<PagedResponse<ProductResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.searchProducts(q, page, size));
    }

    @GetMapping("/public/category/{categoryId}")
    public ResponseEntity<PagedResponse<ProductResponse>> byCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId, page, size));
    }

    @GetMapping("/public/price-range")
    public ResponseEntity<PagedResponse<ProductResponse>> byPriceRange(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.getProductsByPriceRange(min, max, page, size));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/public/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductReviews(id));
    }

    // ── Authenticated customer adds a review ──────────────────────

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable Long id,
            @RequestHeader("X-User-Id")   String userIdStr,
            @RequestHeader("X-User-Name") String customerEmail,
            @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(
            productService.addReview(id, Long.parseLong(userIdStr), customerEmail, req));
    }
}