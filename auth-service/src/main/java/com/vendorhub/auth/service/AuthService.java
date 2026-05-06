package com.vendorhub.auth.service;

import com.vendorhub.auth.dto.AuthDTOs.*;
import com.vendorhub.auth.entity.User;
import com.vendorhub.auth.entity.User.*;
import com.vendorhub.auth.event.UserRegisteredEvent;
import com.vendorhub.auth.event.VendorApprovedEvent;
import com.vendorhub.auth.kafka.AuthEventProducer;
import com.vendorhub.auth.repository.UserRepository;
import com.vendorhub.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final AuthEventProducer eventProducer;

    // ── Customer Registration ─────────────────────────────────────
    // Customers are immediately ACTIVE — no email verification required
    public AuthResponse registerCustomer(CustomerRegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .role(Role.ROLE_CUSTOMER)
                .status(AccountStatus.ACTIVE)           // ← active immediately
                .approvalStatus(ApprovalStatus.NOT_APPLICABLE)
                .build();
        User saved = userRepository.save(user);

        // Try to send a welcome email but don't block registration if it fails
        try {
            emailService.sendWelcomeEmail(saved.getEmail(), saved.getFirstName());
        } catch (Exception e) {
            log.warn("Welcome email failed for {}: {}", saved.getEmail(), e.getMessage());
        }

        // Publish event
        try {
            eventProducer.publishUserRegistered(UserRegisteredEvent.builder()
                    .userId(saved.getId())
                    .email(saved.getEmail())
                    .firstName(saved.getFirstName())
                    .lastName(saved.getLastName())
                    .role(saved.getRole().name())
                    .registeredAt(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("Kafka event failed for customer {}: {}", saved.getEmail(), e.getMessage());
        }

        // Return token immediately so the frontend can log them in
        String token = jwtUtil.generateToken(saved);
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(UserDTO.from(saved));
        return response;
    }

    // ── Vendor Registration ───────────────────────────────────────
    // Vendors still go through: email verify → admin approval → active
    public MessageResponse registerVendor(VendorRegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        String token = UUID.randomUUID().toString();
        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .role(Role.ROLE_VENDOR)
                .status(AccountStatus.PENDING_EMAIL_VERIFICATION)
                .approvalStatus(ApprovalStatus.PENDING)
                .businessName(req.getBusinessName())
                .businessDescription(req.getBusinessDescription())
                .businessAddress(req.getBusinessAddress())
                .emailVerificationToken(token)
                .emailVerificationExpiry(LocalDateTime.now().plusHours(24))
                .build();
        userRepository.save(user);

        try {
            emailService.sendEmailVerification(user.getEmail(), user.getFirstName(), token);
        } catch (Exception e) {
            log.warn("Verification email failed for vendor {}: {}", user.getEmail(), e.getMessage());
        }

        try {
            eventProducer.publishUserRegistered(UserRegisteredEvent.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .role(user.getRole().name())
                    .registeredAt(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("Kafka event failed for vendor {}: {}", user.getEmail(), e.getMessage());
        }

        return new MessageResponse(
            "Vendor registration successful! Please verify your email. " +
            "After verification, your account will be reviewed by our admin team."
        );
    }

    // ── Email Verification (vendors only) ─────────────────────────
    public MessageResponse verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        if (user.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token has expired.");
        }

        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiry(null);
        user.setStatus(AccountStatus.EMAIL_VERIFIED); // Still needs admin approval
        userRepository.save(user);

        return new MessageResponse(
            "Email verified! Your vendor account is now pending admin approval."
        );
    }

    // ── Login ─────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Vendor-specific checks
        if (user.getRole() == Role.ROLE_VENDOR) {
            if (user.getStatus() == AccountStatus.PENDING_EMAIL_VERIFICATION) {
                throw new IllegalStateException("Please verify your email before logging in.");
            }
            if (user.getApprovalStatus() == ApprovalStatus.PENDING ||
                user.getStatus() == AccountStatus.EMAIL_VERIFIED) {
                throw new IllegalStateException("Your vendor account is pending admin approval.");
            }
            if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
                throw new IllegalStateException("Your vendor account application was not approved.");
            }
        }

        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw new IllegalStateException("Your account has been suspended. Please contact support.");
        }

        String token = jwtUtil.generateToken(user);
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(UserDTO.from(user));
        return response;
    }

    // ── Password Reset ────────────────────────────────────────────
    public MessageResponse forgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmail(req.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
            } catch (Exception e) {
                log.warn("Password reset email failed: {}", e.getMessage());
            }
        });
        return new MessageResponse("If that email exists, a password reset link has been sent.");
    }

    public MessageResponse resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByPasswordResetToken(req.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        if (user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired.");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
        return new MessageResponse("Password reset successfully. You can now log in.");
    }

    // ── Admin Operations ──────────────────────────────────────────
    public List<UserDTO> getAllVendors() {
        return userRepository.findByRole(Role.ROLE_VENDOR)
                .stream().map(UserDTO::from).toList();
    }

    public List<UserDTO> getPendingVendors() {
        return userRepository.findByRoleAndApprovalStatus(Role.ROLE_VENDOR, ApprovalStatus.PENDING)
                .stream().map(UserDTO::from).toList();
    }

    public UserDTO approveVendor(Long vendorId, boolean approve) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        if (vendor.getRole() != Role.ROLE_VENDOR) {
            throw new IllegalArgumentException("User is not a vendor");
        }
        vendor.setApprovalStatus(approve ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED);
        if (approve) vendor.setStatus(AccountStatus.ACTIVE);
        userRepository.save(vendor);

        try {
            emailService.sendVendorApprovalNotification(
                vendor.getEmail(), vendor.getFirstName(), vendor.getBusinessName(), approve);
        } catch (Exception e) {
            log.warn("Vendor approval email failed: {}", e.getMessage());
        }

        try {
            eventProducer.publishVendorApproved(VendorApprovedEvent.builder()
                    .vendorId(vendor.getId())
                    .email(vendor.getEmail())
                    .firstName(vendor.getFirstName())
                    .businessName(vendor.getBusinessName())
                    .approved(approve)
                    .processedAt(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("Kafka vendor approved event failed: {}", e.getMessage());
        }

        return UserDTO.from(vendor);
    }

    public void suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);
    }

    public void removeUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.deleteById(userId);
    }

    public List<UserDTO> getAllCustomers() {
        return userRepository.findByRole(Role.ROLE_CUSTOMER)
                .stream().map(UserDTO::from).toList();
    }

    // ── Profile ───────────────────────────────────────────────────
    public UserDTO getProfile(String email) {
        return UserDTO.from(userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
    }

    public UserDTO updateProfile(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (req.getFirstName() != null)           user.setFirstName(req.getFirstName());
        if (req.getLastName() != null)            user.setLastName(req.getLastName());
        if (req.getPhone() != null)               user.setPhone(req.getPhone());
        if (req.getBusinessName() != null)        user.setBusinessName(req.getBusinessName());
        if (req.getBusinessDescription() != null) user.setBusinessDescription(req.getBusinessDescription());
        if (req.getBusinessAddress() != null)     user.setBusinessAddress(req.getBusinessAddress());
        return UserDTO.from(userRepository.save(user));
    }

    public UserDTO getUserById(Long id) {
        return UserDTO.from(userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
    }
}