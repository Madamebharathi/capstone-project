package com.bank.loanpricing.controller;

import com.bank.loanpricing.model.User;
import com.bank.loanpricing.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;


//@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor

public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public User createUser(@Valid @RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true);
        user.setCreatedAt(Instant.now());
        return userRepository.save(user);
    }
    @PutMapping("/{id}/status")
    public User updateUserStatus(@PathVariable String id, @RequestBody Map<String, Boolean> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(payload.get("active"));
        return userRepository.save(user);
    }
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
