package com.vendorhub.product.controller;

import com.vendorhub.product.dto.ProductDTOs.*;
import com.vendorhub.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/vendor/products")
@RequiredArgsConstructor
public class VendorProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getMyProducts(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(productService.getVendorProducts(Long.parseLong(userIdStr)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStock(
            @RequestHeader("X-User-Id") String userIdStr) {
        return ResponseEntity.ok(productService.getVendorLowStockProducts(Long.parseLong(userIdStr)));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @RequestHeader("X-User-Id")   String userIdStr,
            @RequestHeader("X-User-Name") String vendorEmail,
            @Valid @RequestBody CreateProductRequest req) {
        return ResponseEntity.ok(productService.createProduct(Long.parseLong(userIdStr), vendorEmail, req));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<MessageResponse> uploadImage(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestParam("file") MultipartFile file) throws IOException {
        String url = productService.uploadProductImage(id, Long.parseLong(userIdStr), file);
        return ResponseEntity.ok(new MessageResponse("Image uploaded: " + url));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestBody UpdateProductRequest req) {
        return ResponseEntity.ok(productService.updateProduct(id, Long.parseLong(userIdStr), req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteProduct(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userIdStr) {
        productService.deleteVendorProduct(id, Long.parseLong(userIdStr));
        return ResponseEntity.ok(new MessageResponse("Product removed successfully"));
    }
}