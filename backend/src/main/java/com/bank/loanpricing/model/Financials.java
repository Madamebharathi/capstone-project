package com.bank.loanpricing.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class Financials {

    @NotNull(message = "Revenue is required")
    @Positive(message = "Revenue must be greater than zero")
    private Long revenue;

    @NotNull(message = "EBITDA is required")
    @Positive(message = "EBITDA must be greater than zero")
    private Long ebitda;

    @NotBlank(message = "Credit rating is required")
    private String rating; // A, B, C, etc.
}
