package com.bank.loanpricing.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String email;
    private String password;   // BCrypt hashed
    private Role role;
    private boolean active;

    private Instant createdAt;
    private Instant updatedAt;
}
