package com.bank.loanpricing.service;

import com.bank.loanpricing.model.User;
import com.bank.loanpricing.repository.UserRepository;
import com.bank.loanpricing.security.SecurityUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setup() {
        // Reset mocks before each test if needed
        Mockito.reset(userRepository);
    }

    @Test
    void shouldReturnCurrentUser() {
        // Arrange
        String email = "test@example.com";
        User user = new User();
        user.setEmail(email);

        // Mock static method SecurityUtil.getCurrentUserEmail()
        try (var mockedSecurity = mockStatic(SecurityUtil.class)) {
            mockedSecurity.when(SecurityUtil::getCurrentUserEmail).thenReturn(email);
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

            // Act
            User result = userService.getCurrentUser();

            // Assert
            assertNotNull(result);
            assertEquals(email, result.getEmail());
        }
    }

    @Test
    void shouldThrowExceptionIfCurrentUserNotFound() {
        // Arrange
        String email = "unknown@example.com";

        try (var mockedSecurity = mockStatic(SecurityUtil.class)) {
            mockedSecurity.when(SecurityUtil::getCurrentUserEmail).thenReturn(email);
            when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

            // Act & Assert
            RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.getCurrentUser());
            assertEquals("User not found", exception.getMessage());
        }
    }
}
