package com.vendorhub.auth.service;

import com.vendorhub.auth.model.Role;
import com.vendorhub.auth.model.User;
import com.vendorhub.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail("admin@vendorhub.com")) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@vendorhub.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .approved(true)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Admin seeded: admin@vendorhub.com / admin123");
        }
    }
}