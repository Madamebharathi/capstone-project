package com.bank.loanpricing.dto;

import com.bank.loanpricing.model.Financials;
import lombok.Data;

@Data
public class LoanResponse {

    private String id;
    private String clientName;
    private Double requestedAmount;
    private String status;

    private Financials financials;
}
