package com.bank.loanpricing.repository;

import com.bank.loanpricing.model.Loan;
import com.bank.loanpricing.model.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.lang.NonNull;

import java.util.List;

public interface LoanRepository extends MongoRepository<Loan, String> {

    @NonNull
    List<Loan> findByDeletedFalse();

    @NonNull
    Page<Loan> findAll(@NonNull Pageable pageable);

    @NonNull
    Page<Loan> findByStatus(@NonNull LoanStatus status, @NonNull Pageable pageable);


}
