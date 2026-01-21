package com.bank.loanpricing.controller;

import com.bank.loanpricing.dto.PriceResponse;
import com.bank.loanpricing.dto.SanctionRequest;
import com.bank.loanpricing.model.Loan;
import com.bank.loanpricing.model.LoanStatus;
import com.bank.loanpricing.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

//@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Loan createLoan(@Valid @RequestBody Loan loan) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return loanService.createLoan(loan, user);
    }

    @GetMapping
    public List<Loan> getLoans() {
        return loanService.getAllLoans();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Loan getLoanById(@PathVariable String id) {
        return loanService.getLoanById(id);
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasRole('USER')")
    public Loan submitLoan(@PathVariable String id) {
        return loanService.submitLoan(id);
    }

    //simple price calculation
    @GetMapping("/{id}/calculate-price")
    @PreAuthorize("hasRole('USER')")
    public PriceResponse calculatePrice(@PathVariable String id) {
        Loan loan = loanService.getLoanById(id);
        double price = loanService.calculatePrice(loan);
        return new PriceResponse(price);
    }

    @PutMapping("/{id}/sanction")
    @PreAuthorize("hasRole('ADMIN')")
    public Loan sanctionLoan(@PathVariable String id,
                             @RequestBody SanctionRequest request) {
        return loanService.sanctionLoan(id, request);
    }

    @PatchMapping("/{id}/under-review")
    @PreAuthorize("hasRole('ADMIN')")
    public Loan markUnderReview(@PathVariable String id) {
        return loanService.markUnderReview(id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public Loan rejectLoan(@PathVariable String id,
                           @RequestBody Map<String, String> body) {
        String rejectReason = body.get("rejectionReason");
        return loanService.rejectLoan(id, rejectReason);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Loan approveLoan(@PathVariable String id) {
        return loanService.approveLoan(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public Loan updateLoan(@PathVariable String id,@Valid @RequestBody Loan updatedLoan) {
        Loan loan = loanService.getLoanById(id); // fetch loan

        // Allow edit ONLY in DRAFT
        if (loan.getStatus() != LoanStatus.DRAFT) {
            throw new RuntimeException("Cannot edit loan after submission");
        }
        // Update non-sensitive fields
        loan.setClientName(updatedLoan.getClientName());
        loan.setLoanType(updatedLoan.getLoanType());
        loan.setRequestedAmount(updatedLoan.getRequestedAmount());
        loan.setProposedInterestRate(updatedLoan.getProposedInterestRate());
        loan.setTenureMonths(updatedLoan.getTenureMonths());

        return loanService.saveLoan(loan);
    }
    @GetMapping("/paginated")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Page<Loan> getLoansPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return loanService.getLoansPaginated(pageable);
    }
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Page<Loan> getLoansByStatus(
            @PathVariable LoanStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return loanService.getLoansByStatus(status, PageRequest.of(page, size));
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Loan deleteLoan(@PathVariable String id) {
        return loanService.softDeleteLoan(id);
    }
}