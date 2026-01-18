package com.bank.loanpricing.controller;

import com.bank.loanpricing.dto.PriceResponse;
import com.bank.loanpricing.dto.SanctionRequest;
import com.bank.loanpricing.model.Loan;
import com.bank.loanpricing.model.LoanStatus;
import com.bank.loanpricing.model.LoanType;
import com.bank.loanpricing.service.LoanService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class LoanControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private LoanService loanService;

    @InjectMocks
    private LoanController loanController;

    private Loan loan;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(loanController).build();

        // Mock SecurityContext
        Authentication authentication = Mockito.mock(Authentication.class);
        Mockito.when(authentication.getName()).thenReturn("testuser");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        Mockito.when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Sample Loan
        loan = new Loan();
        loan.setId("1");
        loan.setClientName("Test Client");
        loan.setLoanType(LoanType.TERM_LOAN);
        loan.setRequestedAmount(10000);
        loan.setProposedInterestRate(5);
        loan.setTenureMonths(12);
        loan.setStatus(LoanStatus.DRAFT);
    }

    @Test
    void shouldCreateLoan() throws Exception {
        Mockito.when(loanService.createLoan(any(Loan.class), anyString())).thenReturn(loan);

        mockMvc.perform(post("/api/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loan)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientName").value("Test Client"));
    }

    @Test
    void shouldGetLoanById() throws Exception {
        Mockito.when(loanService.getLoanById("1")).thenReturn(loan);

        mockMvc.perform(get("/api/loans/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientName").value("Test Client"));
    }

    @Test
    void shouldCalculatePrice() throws Exception {
        Mockito.when(loanService.getLoanById("1")).thenReturn(loan);
        Mockito.when(loanService.calculatePrice(any(Loan.class))).thenReturn(10500.0);

        mockMvc.perform(get("/api/loans/1/calculate-price"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.calculatedPrice").value(10500.0));
    }

    @Test
    void shouldSanctionLoan() throws Exception {
        SanctionRequest request = new SanctionRequest();
        request.setSanctionedAmount(9000.0);
        request.setApprovedInterestRate(4.5);

        loan.setStatus(LoanStatus.APPROVED);
        Mockito.when(loanService.sanctionLoan(anyString(), any(SanctionRequest.class))).thenReturn(loan);

        mockMvc.perform(put("/api/loans/1/sanction")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void shouldRejectLoan() throws Exception {
        loan.setStatus(LoanStatus.REJECTED);
        Mockito.when(loanService.rejectLoan(eq("1"), anyString())).thenReturn(loan);

        mockMvc.perform(patch("/api/loans/1/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("rejectionReason", "Bad credit"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void shouldApproveLoan() throws Exception {
        loan.setStatus(LoanStatus.APPROVED);
        Mockito.when(loanService.approveLoan("1")).thenReturn(loan);

        mockMvc.perform(patch("/api/loans/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void shouldUpdateLoan() throws Exception {
        Loan updatedLoan = new Loan();
        updatedLoan.setClientName("Updated Client");
        updatedLoan.setLoanType(LoanType.SME_LOAN);
        updatedLoan.setRequestedAmount(15000);
        updatedLoan.setProposedInterestRate(6);
        updatedLoan.setTenureMonths(24);

        loan.setStatus(LoanStatus.DRAFT);
        Mockito.when(loanService.getLoanById("1")).thenReturn(loan);
        Mockito.when(loanService.saveLoan(any(Loan.class))).thenReturn(updatedLoan);

        mockMvc.perform(put("/api/loans/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedLoan)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientName").value("Updated Client"));
    }

    @Test
    void shouldGetPaginatedLoans() throws Exception {
        // Return a concrete PageImpl with a list of loans
        Mockito.when(loanService.getLoansPaginated(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(loan)));

        mockMvc.perform(get("/api/loans/paginated")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].clientName").value("Test Client"));
    }
    
    @Test
    void shouldDeleteLoan() throws Exception {
        loan.setStatus(LoanStatus.DRAFT);
        Mockito.when(loanService.softDeleteLoan("1")).thenReturn(loan);

        mockMvc.perform(delete("/api/loans/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientName").value("Test Client"));
    }
}
