package com.vendorhub.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @ToString.Exclude
    private Cart cart;

    @Column(nullable = false)
    private Long productId;

    private String productName;
    private String productImageUrl;
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    private Long vendorId;
    private String vendorEmail;
}