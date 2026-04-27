package com.vendorhub.product.controller;

import com.vendorhub.product.dto.ProductDto;
import com.vendorhub.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDto>> getFavorites(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(productService.getFavorites(userId));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long productId,
                                             Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        productService.addFavorite(userId, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long productId,
                                                Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        productService.removeFavorite(userId, productId);
        return ResponseEntity.noContent().build();
    }
}