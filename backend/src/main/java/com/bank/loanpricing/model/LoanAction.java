package com.bank.loanpricing.model;

import lombok.Data;
import java.time.Instant;

@Data
public class LoanAction {

    private String by;        // userId
    private String action;    // CREATED, SUBMITTED, APPROVED, REJECTED
    private String comments;
    private Instant timestamp;
}
