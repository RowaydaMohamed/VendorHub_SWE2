package com.vendorhub.auth.controller;

import com.vendorhub.auth.dto.AuthDTOs.*;
import com.vendorhub.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AuthService authService;

    @GetMapping("/vendors")
    public ResponseEntity<List<UserDTO>> getAllVendors() {
        return ResponseEntity.ok(authService.getAllVendors());
    }

    @GetMapping("/vendors/pending")
    public ResponseEntity<List<UserDTO>> getPendingVendors() {
        return ResponseEntity.ok(authService.getPendingVendors());
    }

    @PatchMapping("/vendors/{id}/approve")
    public ResponseEntity<UserDTO> approveVendor(@PathVariable Long id) {
        return ResponseEntity.ok(authService.approveVendor(id, true));
    }

    @PatchMapping("/vendors/{id}/reject")
    public ResponseEntity<UserDTO> rejectVendor(@PathVariable Long id) {
        return ResponseEntity.ok(authService.approveVendor(id, false));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDTO>> getAllCustomers() {
        return ResponseEntity.ok(authService.getAllCustomers());
    }

    @PatchMapping("/{id}/suspend")
    public ResponseEntity<MessageResponse> suspendUser(@PathVariable Long id) {
        authService.suspendUser(id);
        return ResponseEntity.ok(new MessageResponse("User suspended successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> removeUser(@PathVariable Long id) {
        authService.removeUser(id);
        return ResponseEntity.ok(new MessageResponse("User removed successfully"));
    }
}