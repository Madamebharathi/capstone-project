package com.bank.loanpricing.service;

import com.bank.loanpricing.dto.SanctionRequest;
import com.bank.loanpricing.exception.BusinessException;
import com.bank.loanpricing.kafka.LoanEventProducer;
import com.bank.loanpricing.model.Financials;
import com.bank.loanpricing.model.Loan;
import com.bank.loanpricing.model.LoanAction;
import com.bank.loanpricing.model.LoanStatus;
import com.bank.loanpricing.repository.LoanRepository;
import com.bank.loanpricing.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanEventProducer loanEventProducer;

    // ---------------- CREATE ----------------
    public Loan createLoan(Loan loan, String userId) {

        loan.setStatus(LoanStatus.DRAFT);
        loan.setCreatedBy(userId);
        loan.setCreatedAt(Instant.now());
        loan.setDeleted(false);

        if (loan.getActions() == null) {
            loan.setActions(new ArrayList<>());
        }

        addAction(loan, "CREATED", "Loan created");
        return loanRepository.save(loan);
    }

    // ---------------- PRICE  ----------------
    public double calculatePrice(Loan loan) {

        double principal = loan.getRequestedAmount();
        double rate = loan.getProposedInterestRate(); // annual %
        double tenureYears = loan.getTenureMonths() / 12.0;

        double price = principal + (principal * rate / 100 * tenureYears);
        return Math.round(price * 100.0) / 100.0;
    }

    // ---------------- READ ----------------
    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public Loan getLoanById(String id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
    }

    // ---------------- WORKFLOW ----------------
    public Loan submitLoan(String id) {
        Loan loan = getLoanById(id);

        if (loan.getStatus() != LoanStatus.DRAFT) {
            throw new BusinessException("Only DRAFT loans can be submitted");
        }

        // 🔐 Mandatory check
        if (loan.getFinancials() == null) {
            throw new BusinessException("Financial details are mandatory before submission");
        }

        validateFinancials(loan.getFinancials());

        loan.setStatus(LoanStatus.SUBMITTED);
        loan.setUpdatedAt(Instant.now());
        loan.setUpdatedBy(currentUser());

        addAction(loan, "SUBMITTED", "Loan submitted for approval");
        Loan savedLoan = loanRepository.save(loan);
        // Publish Kafka event
        String eventMessage = "{ \"loanId\": \"" + savedLoan.getId() + "\", \"status\": \"" + savedLoan.getStatus() + "\", \"actionBy\": \"" + currentUser() + "\" }";
        loanEventProducer.publishEvent(eventMessage);

        return savedLoan;
    }

    public Loan markUnderReview(String id) {
        Loan loan = getLoanById(id);

        if (loan.getStatus() != LoanStatus.SUBMITTED) {
            throw new RuntimeException("Loan must be SUBMITTED to move to UNDER_REVIEW");
        }

        loan.setStatus(LoanStatus.UNDER_REVIEW);
        loan.setUpdatedAt(Instant.now());
        loan.setUpdatedBy(currentUser());

        addAction(loan, "UNDER_REVIEW", "Loan moved to under review");
        return loanRepository.save(loan);
    }

    public Loan sanctionLoan(String id, SanctionRequest request) {

        Loan loan = getLoanById(id);

        if (loan.getStatus() != LoanStatus.UNDER_REVIEW) {
            throw new BusinessException("Loan must be UNDER_REVIEW to sanction");
        }

        if (request.getSanctionedAmount() == null || request.getSanctionedAmount() <= 0) {
            throw new BusinessException("Sanctioned amount must be greater than zero");
        }

        if (request.getApprovedInterestRate() == null || request.getApprovedInterestRate() <= 0) {
            throw new BusinessException("Approved interest rate must be valid");
        }

        loan.setSanctionedAmount(request.getSanctionedAmount());
        loan.setApprovedInterestRate(request.getApprovedInterestRate());
        loan.setUpdatedBy(currentUser());
        loan.setUpdatedAt(Instant.now());

        addAction(loan, "SANCTIONED", "Loan sanctioned by admin");

        return loanRepository.save(loan);
    }


    public Loan approveLoan(String id) {
        Loan loan = getLoanById(id);

        if (loan.getStatus() != LoanStatus.UNDER_REVIEW) {
            throw new RuntimeException("Loan must be UNDER_REVIEW to approve");
        }

        loan.setStatus(LoanStatus.APPROVED);
        loan.setApprovedBy(currentUser());
        loan.setApprovedAt(Instant.now());
        loan.setUpdatedAt(Instant.now());
        loan.setUpdatedBy(currentUser());

        addAction(loan, "APPROVED", "Loan approved");
        Loan savedLoan = loanRepository.save(loan);
        // Publish Kafka event
        String eventMessage = "{ \"loanId\": \"" + savedLoan.getId() + "\", \"status\": \"" + savedLoan.getStatus() + "\", \"actionBy\": \"" + currentUser() + "\" }";
        loanEventProducer.publishEvent(eventMessage);

        return savedLoan;
    }

    public Loan rejectLoan(String id, String reason) {
        Loan loan = getLoanById(id);

        if (loan.getStatus() != LoanStatus.UNDER_REVIEW) {
            throw new RuntimeException("Loan must be UNDER_REVIEW to reject");
        }

        if (reason == null || reason.isBlank()) {
            throw new BusinessException("Rejection reason is mandatory");
        }

        loan.setStatus(LoanStatus.REJECTED);
        loan.setRejectionReason(reason);
        loan.setUpdatedAt(Instant.now());
        loan.setUpdatedBy(currentUser());

        addAction(loan, "REJECTED", reason);
        Loan savedLoan = loanRepository.save(loan);
        // Publish Kafka event
        String eventMessage = "{ \"loanId\": \"" + savedLoan.getId() + "\", \"status\": \"" + savedLoan.getStatus() + "\", \"actionBy\": \"" + currentUser() + "\" }";
        loanEventProducer.publishEvent(eventMessage);

        return savedLoan;
    }

    // ---------------- UPDATE ----------------
    public Loan saveLoan(Loan loan) {
        loan.setUpdatedAt(Instant.now());
        loan.setUpdatedBy(currentUser());

        if (loan.getStatus() != LoanStatus.DRAFT) {
            validateFinancials(loan.getFinancials());
        }

        addAction(loan, "UPDATED", "Loan fields updated");
        return loanRepository.save(loan);
    }

    // ---------------- DELETE ----------------
    public Loan softDeleteLoan(String id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setDeleted(true);
        loan.setDeletedAt(Instant.now());
        loan.setDeletedBy(currentUser());

        addAction(loan, "DELETED", "Loan soft deleted");
        return loanRepository.save(loan);
    }

    public Page<Loan> getLoansPaginated(Pageable pageable) {
        return loanRepository.findAll(pageable);
    }
    public Page<Loan> getLoansByStatus(LoanStatus status, Pageable pageable) {
        return loanRepository.findByStatus(status, pageable);
    }

    // ---------------- HELPERS ----------------
    private String currentUser() {
        String userId = SecurityUtil.getCurrentUserId();

        if (userId != null && !userId.isBlank()) {
            return userId;
        }

        // fallback ONLY if ID is missing
        return SecurityUtil.getCurrentUserEmail();
    }

    private void addAction(Loan loan, String action, String comments) {

        if (loan.getActions() == null) {
            loan.setActions(new ArrayList<>());
        }

        LoanAction audit = new LoanAction();
        audit.setBy(currentUser()); // this now returns userId
        audit.setAction(action);
        audit.setComments(comments);
        audit.setTimestamp(Instant.now());

        loan.getActions().add(audit);
    }
    private void validateFinancials(Financials financials) {

        if (financials == null) {
            return; // allowed for DRAFT
        }

        if (financials.getRevenue() == null || financials.getRevenue() <= 0) {
            throw new BusinessException("Revenue must be greater than zero");
        }

        if (financials.getEbitda() == null) {
            throw new BusinessException("EBITDA is required");
        }

        if (financials.getRating() == null || financials.getRating().isBlank()) {
            throw new BusinessException("Financial rating is required");
        }
    }
}
