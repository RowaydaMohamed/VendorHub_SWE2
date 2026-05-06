package com.vendorhub.product.repository;

import com.vendorhub.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Public: approved & active products
    Page<Product> findByApprovalStatusAndActiveTrue(Product.ApprovalStatus status, Pageable pageable);

    // Search by name or description (approved only)
    @Query("SELECT p FROM Product p WHERE p.approvalStatus = 'APPROVED' AND p.active = true " +
           "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchApproved(@Param("query") String query, Pageable pageable);

    // Filter by category
    @Query("SELECT p FROM Product p WHERE p.approvalStatus = 'APPROVED' AND p.active = true " +
           "AND p.category.id = :categoryId")
    Page<Product> findApprovedByCategory(@Param("categoryId") Long categoryId, Pageable pageable);

    // Filter by price range
    @Query("SELECT p FROM Product p WHERE p.approvalStatus = 'APPROVED' AND p.active = true " +
           "AND p.price BETWEEN :min AND :max")
    Page<Product> findApprovedByPriceRange(@Param("min") BigDecimal min,
                                            @Param("max") BigDecimal max, Pageable pageable);

    // Vendor's own products
    List<Product> findByVendorId(Long vendorId);

    Page<Product> findByVendorId(Long vendorId, Pageable pageable);

    // Admin: all products by status
    Page<Product> findByApprovalStatus(Product.ApprovalStatus status, Pageable pageable);

    // Low stock products for a vendor
    @Query("SELECT p FROM Product p WHERE p.vendorId = :vendorId AND p.stockQuantity <= :threshold AND p.active = true")
    List<Product> findLowStockByVendor(@Param("vendorId") Long vendorId, @Param("threshold") int threshold);
}