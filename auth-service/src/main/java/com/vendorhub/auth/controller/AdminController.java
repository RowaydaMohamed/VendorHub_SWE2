package com.vendorhub.auth.controller;

import com.vendorhub.auth.dto.UserDto;
import com.vendorhub.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AuthService authService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/vendors/pending")
    public ResponseEntity<List<UserDto>> getPendingVendors() {
        return ResponseEntity.ok(authService.getPendingVendors());
    }

    @PutMapping("/vendors/{id}/approve")
    public ResponseEntity<UserDto> approveVendor(@PathVariable Long id) {
        return ResponseEntity.ok(authService.approveVendor(id));
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<UserDto> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(authService.toggleUserActive(id));
    }
}