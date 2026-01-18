package com.bank.loanpricing.dto;

import com.bank.loanpricing.model.Financials;
import lombok.Data;

@Data
public class LoanCreateRequest {

    private String clientName;
    private String loanType;
    private Double requestedAmount;
    private Integer tenureMonths;

    private Financials financials;
}
