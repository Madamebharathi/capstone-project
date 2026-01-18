package com.bank.loanpricing.service;

import com.bank.loanpricing.dto.*;
import com.bank.loanpricing.exception.BusinessException;
import com.bank.loanpricing.model.Role;
import com.bank.loanpricing.model.User;
import com.bank.loanpricing.repository.UserRepository;
import com.bank.loanpricing.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid credentials"));

        boolean passwordMatches;

        // Handle existing plain-text users
        if (!user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$")) {
            passwordMatches = request.getPassword().equals(user.getPassword());
            // Upgrade password to encoded automatically
            if (passwordMatches) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
            }
        } else {
            // Encoded passwords
            passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        }

        if (!passwordMatches) {
            throw new BusinessException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new BusinessException("User account is inactive");
        }

        return new LoginResponse(jwtUtil.generateToken(user));
    }

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("User already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        user.setActive(true);

        userRepository.save(user);
    }
}
