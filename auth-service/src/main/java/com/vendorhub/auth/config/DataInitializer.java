package com.vendorhub.auth.config;

import com.vendorhub.auth.entity.User;
import com.vendorhub.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@vendorhub.com")) {
            User admin = User.builder()
                    .email("admin@vendorhub.com")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .firstName("VendorHub")
                    .lastName("Admin")
                    .phone("+1-000-000-0000")
                    .role(User.Role.ROLE_ADMIN)
                    .status(User.AccountStatus.ACTIVE)
                    .approvalStatus(User.ApprovalStatus.NOT_APPLICABLE)
                    .build();
            userRepository.save(admin);
            log.info("=== Admin user seeded: admin@vendorhub.com / Admin@1234 ===");
        }
    }
}