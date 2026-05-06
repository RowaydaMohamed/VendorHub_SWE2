package com.vendorhub.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccountStatus status = AccountStatus.PENDING_EMAIL_VERIFICATION;

    // For vendors: admin approval status
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.NOT_APPLICABLE;

    @Column(unique = true)
    private String emailVerificationToken;

    private LocalDateTime emailVerificationExpiry;

    private String passwordResetToken;

    private LocalDateTime passwordResetExpiry;

    // Vendor-specific fields
    private String businessName;
    private String businessDescription;
    private String businessAddress;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Role {
        ROLE_ADMIN, ROLE_VENDOR, ROLE_CUSTOMER
    }

    public enum AccountStatus {
        PENDING_EMAIL_VERIFICATION,
        EMAIL_VERIFIED,
        ACTIVE,
        SUSPENDED
    }

    public enum ApprovalStatus {
        NOT_APPLICABLE,   // for admin/customer
        PENDING,          // vendor awaiting admin approval
        APPROVED,         // vendor approved
        REJECTED          // vendor rejected
    }
}