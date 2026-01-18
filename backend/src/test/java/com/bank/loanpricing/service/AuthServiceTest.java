package com.bank.loanpricing.service;

import com.bank.loanpricing.dto.LoginRequest;
import com.bank.loanpricing.dto.LoginResponse;
import com.bank.loanpricing.dto.RegisterRequest;
import com.bank.loanpricing.exception.BusinessException;
import com.bank.loanpricing.model.Role;
import com.bank.loanpricing.model.User;
import com.bank.loanpricing.repository.UserRepository;
import com.bank.loanpricing.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    // ---------------- LOGIN ----------------

    @Test
    void shouldLoginSuccessfully_withEncodedPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@mail.com");
        request.setPassword("password123");

        User user = new User();
        user.setEmail("test@mail.com");
        user.setPassword("$2a$encoded"); // encoded password
        user.setActive(true);

        when(userRepository.findByEmail("test@mail.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$encoded"))
                .thenReturn(true);
        when(jwtUtil.generateToken(user))
                .thenReturn("jwt-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
    }

    @Test
    void shouldLoginSuccessfully_withPlainTextPasswordAndUpgrade() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@mail.com");
        request.setPassword("password123");

        User user = new User();
        user.setEmail("test@mail.com");
        user.setPassword("password123"); // plain text
        user.setActive(true);

        when(userRepository.findByEmail("test@mail.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.encode("password123"))
                .thenReturn("$2a$encoded");
        when(jwtUtil.generateToken(user))
                .thenReturn("jwt-token");

        LoginResponse response = authService.login(request);

        assertEquals("jwt-token", response.getToken());
        verify(userRepository).save(user); // password upgraded
    }

    @Test
    void shouldFailLoginIfUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@mail.com");
        request.setPassword("pass");

        when(userRepository.findByEmail("missing@mail.com"))
                .thenReturn(Optional.empty());

        assertThrows(BusinessException.class,
                () -> authService.login(request));
    }

    @Test
    void shouldFailLoginIfPasswordIncorrect() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@mail.com");
        request.setPassword("wrong");

        User user = new User();
        user.setEmail("test@mail.com");
        user.setPassword("$2a$encoded");
        user.setActive(true);

        when(userRepository.findByEmail("test@mail.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "$2a$encoded"))
                .thenReturn(false);

        assertThrows(BusinessException.class,
                () -> authService.login(request));
    }

    @Test
    void shouldFailLoginIfUserInactive() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@mail.com");
        request.setPassword("password123");

        User user = new User();
        user.setEmail("test@mail.com");
        user.setPassword("$2a$encoded");
        user.setActive(false);

        when(userRepository.findByEmail("test@mail.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$encoded"))
                .thenReturn(true);

        assertThrows(BusinessException.class,
                () -> authService.login(request));
    }

    // ---------------- REGISTER ----------------

    @Test
    void shouldRegisterUserSuccessfully() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@mail.com");
        request.setPassword("password");
        request.setRole("admin");

        when(userRepository.existsByEmail("new@mail.com"))
                .thenReturn(false);
        when(passwordEncoder.encode("password"))
                .thenReturn("$2a$encoded");

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldFailRegisterIfUserExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@mail.com");
        request.setPassword("password");
        request.setRole("user");

        when(userRepository.existsByEmail("existing@mail.com"))
                .thenReturn(true);

        assertThrows(BusinessException.class,
                () -> authService.register(request));
    }
}
