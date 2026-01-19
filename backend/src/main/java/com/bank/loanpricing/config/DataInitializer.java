package com.bank.loanpricing.config;

import com.bank.loanpricing.model.Role;
import com.bank.loanpricing.model.User;
import com.bank.loanpricing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        String adminEmail = "admin@loanapp.com";

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("ℹ️  Admin user already exists, skipping initialization");
            return;
        }

        try {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .active(true)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            userRepository.save(admin);

            log.info("✅ ============================================");
            log.info("✅ Default admin user created successfully!");
            log.info("✅ ============================================");
            log.info("   📧 Email: {}", adminEmail);
            log.info("   🔑 Password: admin123");
            log.info("   👤 Role: ADMIN");
            log.info("   ✓ Active: true");
            log.info("✅ ============================================");

        } catch (Exception e) {
            log.error("❌ Failed to create admin user: {}", e.getMessage(), e);
        }
    }
}