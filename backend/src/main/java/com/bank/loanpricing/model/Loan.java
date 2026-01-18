package com.bank.loanpricing.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "loans")
public class Loan {

    @Id
    private String id;

    @NotBlank
    private String clientName;

    @NotNull
    private LoanType loanType;

    @Positive
    private double requestedAmount;

    @DecimalMin("0.1")
    private double proposedInterestRate;

    @Min(6)
    private int tenureMonths;

    // Embedded financials
    @Valid
    private Financials financials;

    @NotNull
    private LoanStatus status = LoanStatus.DRAFT;

    // Admin-only fields
    private Double sanctionedAmount;
    private Double approvedInterestRate;

    // Audit fields
    private String createdBy;
    private String updatedBy;
    private String approvedBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant approvedAt;

    // Rejection info
    private String rejectionReason;

    // Audit trail
    private List<LoanAction> actions = new ArrayList<>();

    // Soft delete
    private boolean deleted = false;
    private String deletedBy;
    private Instant deletedAt;
}
