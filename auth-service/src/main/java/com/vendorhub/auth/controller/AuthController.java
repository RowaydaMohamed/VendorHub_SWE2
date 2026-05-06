package com.vendorhub.auth.controller;

import com.vendorhub.auth.dto.AuthDTOs.*;
import com.vendorhub.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Customer registration — returns token + user immediately.
     * No email verification required: customer is active on registration.
     */
    @PostMapping("/register/customer")
    public ResponseEntity<AuthResponse> registerCustomer(
            @Valid @RequestBody CustomerRegisterRequest req) {
        return ResponseEntity.ok(authService.registerCustomer(req));
    }

    /**
     * Vendor registration — returns a message only.
     * Vendor must verify email, then wait for admin approval before logging in.
     */
    @PostMapping("/register/vendor")
    public ResponseEntity<MessageResponse> registerVendor(
            @Valid @RequestBody VendorRegisterRequest req) {
        return ResponseEntity.ok(authService.registerVendor(req));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req) {
        return ResponseEntity.ok(authService.forgotPassword(req));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(authService.resetPassword(req));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@RequestHeader("X-User-Name") String email) {
        return ResponseEntity.ok(authService.getProfile(email));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(
            @RequestHeader("X-User-Name") String email,
            @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(authService.updateProfile(email, req));
    }

    /** Internal: other services fetch user details by ID */
    @GetMapping("/internal/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }
}