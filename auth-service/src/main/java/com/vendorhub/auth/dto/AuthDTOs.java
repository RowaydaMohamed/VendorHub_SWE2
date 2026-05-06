package com.vendorhub.auth.dto;

import com.vendorhub.auth.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

// ─── Request DTOs ───────────────────────────────────────────────

public class AuthDTOs {

    @Data
    public static class CustomerRegisterRequest {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 8)
        private String password;

        @NotBlank
        private String firstName;

        @NotBlank
        private String lastName;

        @NotBlank
        private String phone;
    }

    @Data
    public static class VendorRegisterRequest {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 8)
        private String password;

        @NotBlank
        private String firstName;

        @NotBlank
        private String lastName;

        @NotBlank
        private String phone;

        @NotBlank
        private String businessName;

        private String businessDescription;
        private String businessAddress;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class ForgotPasswordRequest {
        @NotBlank @Email
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank
        private String token;

        @NotBlank @Size(min = 8)
        private String newPassword;
    }

    // ─── Response DTOs ──────────────────────────────────────────

    @Data
    public static class AuthResponse {
        private String token;
        private UserDTO user;
    }

    @Data
    public static class UserDTO {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private User.Role role;
        private User.AccountStatus status;
        private User.ApprovalStatus approvalStatus;
        private String businessName;
        private String businessDescription;
        private String businessAddress;

        public static UserDTO from(User user) {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setEmail(user.getEmail());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole());
            dto.setStatus(user.getStatus());
            dto.setApprovalStatus(user.getApprovalStatus());
            dto.setBusinessName(user.getBusinessName());
            dto.setBusinessDescription(user.getBusinessDescription());
            dto.setBusinessAddress(user.getBusinessAddress());
            return dto;
        }
    }

    @Data
    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
    }

    @Data
    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String businessName;
        private String businessDescription;
        private String businessAddress;
    }
}