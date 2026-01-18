package com.bank.loanpricing.controller;

import com.bank.loanpricing.model.Role;
import com.bank.loanpricing.model.User;
import com.bank.loanpricing.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class UserControllerTest {

    private UserService userService;
    private UserController userController;

    @BeforeEach
    void setUp() {
        // Create a Mockito mock of the service
        userService = Mockito.mock(UserService.class);

        // Inject the mock into the controller manually
        userController = new UserController(userService);
    }

    @Test
    void shouldReturnLoggedInUser() {
        // Arrange: create a test user
        User testUser = User.builder()
                .id("123")
                .email("testuser@example.com")
                .password("dummyPassword")
                .role(Role.USER)
                .active(true)
                .build();

        // Mock the service call
        Mockito.when(userService.getCurrentUser()).thenReturn(testUser);

        // Act: call the controller method
        User result = userController.getLoggedInUser();

        // Assert: verify the returned user matches the mock
        assertNotNull(result);
        assertEquals("123", result.getId());
        assertEquals("testuser@example.com", result.getEmail());
        assertEquals(Role.USER, result.getRole());
        assertTrue(result.isActive());

        // Verify service method was called exactly once
        Mockito.verify(userService, Mockito.times(1)).getCurrentUser();
    }
}
