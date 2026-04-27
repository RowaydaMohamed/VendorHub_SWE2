package com.vendorhub.product.controller;

import com.vendorhub.product.dto.ReviewDto;
import com.vendorhub.product.dto.ReviewRequest;
import com.vendorhub.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ProductService productService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getReviews(productId));
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<ReviewDto> addReview(@PathVariable Long productId,
                                                @Valid @RequestBody ReviewRequest request,
                                                Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        String userName = (String) auth.getPrincipal();
        return ResponseEntity.ok(
            productService.addReview(productId, userId, userName, request));
    }
}