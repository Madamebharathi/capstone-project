package com.bank.loanpricing.service;

import com.bank.loanpricing.dto.SanctionRequest;
import com.bank.loanpricing.exception.BusinessException;
import com.bank.loanpricing.kafka.LoanEventProducer;
import com.bank.loanpricing.model.Financials;
import com.bank.loanpricing.model.Loan;
import com.bank.loanpricing.model.LoanStatus;
import com.bank.loanpricing.repository.LoanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private LoanEventProducer loanEventProducer;

    @InjectMocks
    private LoanService loanService;

    @BeforeEach
    void setupSecurityContext() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("test-user", null)
        );
    }

    private Loan createLoan(LoanStatus status) {
        Loan loan = new Loan();
        loan.setId("1");
        loan.setStatus(status);
        loan.setRequestedAmount(100000);
        loan.setProposedInterestRate(10);
        loan.setTenureMonths(12);
        loan.setActions(new ArrayList<>());
        return loan;
    }

    private Financials validFinancials() {
        Financials f = new Financials();
        f.setRevenue(1_000_000L);
        f.setEbitda(200_000L);
        f.setRating("A");
        return f;
    }

    // ---------- CREATE ----------
    @Test
    void shouldCreateLoan() {
        Loan loan = createLoan(null);
        when(loanRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Loan result = loanService.createLoan(loan, "user1");

        assertEquals(LoanStatus.DRAFT, result.getStatus());
        assertEquals("user1", result.getCreatedBy());
    }

    // ---------- PRICE ----------
    @Test
    void shouldCalculatePrice() {
        Loan loan = createLoan(LoanStatus.DRAFT);
        assertEquals(110000, loanService.calculatePrice(loan));
    }

    // ---------- READ ----------
    @Test
    void shouldReturnAllLoans() {
        when(loanRepository.findAll()).thenReturn(List.of(new Loan(), new Loan()));
        assertEquals(2, loanService.getAllLoans().size());
    }

    @Test
    void shouldFailGetLoanNotFound() {
        when(loanRepository.findById("1")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> loanService.getLoanById("1"));
    }

    // ---------- SUBMIT ----------
    @Test
    void shouldSubmitLoan() {
        Loan loan = createLoan(LoanStatus.DRAFT);
        loan.setFinancials(validFinancials());

        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any())).thenReturn(loan);

        Loan result = loanService.submitLoan("1");

        assertEquals(LoanStatus.SUBMITTED, result.getStatus());
        verify(loanEventProducer).publishEvent(any());
    }

    @Test
    void shouldFailSubmitIfNotDraft() {
        Loan loan = createLoan(LoanStatus.APPROVED);
        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));

        assertThrows(BusinessException.class,
                () -> loanService.submitLoan("1"));
    }

    @Test
    void shouldFailSubmitWithoutFinancials() {
        Loan loan = createLoan(LoanStatus.DRAFT);
        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));

        assertThrows(BusinessException.class,
                () -> loanService.submitLoan("1"));
    }

    // ---------- UNDER REVIEW ----------
    @Test
    void shouldMoveToUnderReview() {
        Loan loan = createLoan(LoanStatus.SUBMITTED);
        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any())).thenReturn(loan);

        Loan result = loanService.markUnderReview("1");
        assertEquals(LoanStatus.UNDER_REVIEW, result.getStatus());
    }

    @Test
    void shouldFailUnderReviewIfWrongStatus() {
        Loan loan = createLoan(LoanStatus.DRAFT);
        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));

        assertThrows(RuntimeException.class,
                () -> loanService.markUnderReview("1"));
    }

    // ---------- APPROVE ----------
    @Test
    void shouldApproveLoan() {
        Loan loan = createLoan(LoanStatus.UNDER_REVIEW);
        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any())).thenReturn(loan);

        Loan result = loanService.approveLoan("1");

        assertEquals(LoanStatus.APPROVED, result.getStatus());
        verify(loanEventProducer).publishEvent(any());
    }

    // ---------- REJECT ----------
    @Test
    void shouldRejectLoan() {
        Loan loan = createLoan(LoanStatus.UNDER_REVIEW);
        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any())).thenReturn(loan);

        Loan result = loanService.rejectLoan("1", "Docs missing");

        assertEquals(LoanStatus.REJECTED, result.getStatus());
        verify(loanEventProducer).publishEvent(any());
    }

    @Test
    void shouldFailRejectWithoutReason() {
        Loan loan = createLoan(LoanStatus.UNDER_REVIEW);
        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));

        assertThrows(BusinessException.class,
                () -> loanService.rejectLoan("1", ""));
    }

    // ---------- SANCTION ----------
    @Test
    void shouldSanctionLoan() {
        Loan loan = createLoan(LoanStatus.UNDER_REVIEW);
        SanctionRequest req = new SanctionRequest();
        req.setSanctionedAmount(50000.0);
        req.setApprovedInterestRate(9.5);

        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any())).thenReturn(loan);

        Loan result = loanService.sanctionLoan("1", req);
        assertEquals(50000.0, result.getSanctionedAmount());
    }

    // ---------- DELETE ----------
    @Test
    void shouldSoftDeleteLoan() {
        Loan loan = createLoan(LoanStatus.DRAFT);
        when(loanRepository.findById("1")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any())).thenReturn(loan);

        Loan result = loanService.softDeleteLoan("1");

        assertTrue(result.isDeleted());
    }
}
