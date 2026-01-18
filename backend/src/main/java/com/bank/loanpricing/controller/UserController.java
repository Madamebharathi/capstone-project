package com.bank.loanpricing.controller;

import com.bank.loanpricing.model.User;
import com.bank.loanpricing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public User getLoggedInUser() {
        return userService.getCurrentUser();
    }
}
