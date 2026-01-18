package com.bank.loanpricing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private Instant timestamp;
    private int status;
    private String error;
    private Object message; // Can be String or Map for field errors
    private String path;
    private String errorCode; // optional for frontend error handling
}
