package com.bank.loanpricing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SanctionRequest {

    @NotNull
    @Positive
    private Double sanctionedAmount;

    @NotNull
    @Positive
    private Double approvedInterestRate;

}
