package com.vendorhub.product.repository;

import com.vendorhub.product.model.Product;
import com.vendorhub.product.model.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByVendorId(Long vendorId);
    List<Product> findByVendorIdAndStatus(Long vendorId, ProductStatus status);
    List<Product> findByStatusAndCategory(ProductStatus status, String category);
    List<Product> findByNameContainingIgnoreCaseAndStatus(String name, ProductStatus status);
}