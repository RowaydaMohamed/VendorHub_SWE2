package com.vendorhub.auth.service;

import com.vendorhub.auth.dto.*;
import com.vendorhub.auth.model.Role;
import com.vendorhub.auth.model.User;
import com.vendorhub.auth.repository.UserRepository;
import com.vendorhub.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());
        boolean approved = role == Role.CUSTOMER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .approved(approved)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(),
                                             saved.getRole().name(),
                                             saved.getId());
        return AuthResponse.builder()
                .token(token)
                .role(saved.getRole().name())
                .userId(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .approved(saved.isApproved())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        String token = jwtUtil.generateToken(user.getEmail(),
                                             user.getRole().name(),
                                             user.getId());
        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .approved(user.isApproved())
                .build();
    }

    public List<UserDto> getPendingVendors() {
        return userRepository.findByRoleAndApproved(Role.VENDOR, false)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto approveVendor(Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setApproved(true);
        return toDto(userRepository.save(vendor));
    }

    public UserDto toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        return toDto(userRepository.save(user));
    }

    public UserDto getUserById(Long userId) {
        return toDto(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .approved(user.isApproved())
                .active(user.isActive())
                .build();
    }
}