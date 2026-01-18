import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';
import { CreateLoanRequest } from '../../models/create-loan.model';

@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './apply-loan.html',
  styleUrls: ['./apply-loan.css']
})
export class ApplyLoanComponent {

  loanForm: FormGroup;
  loading = false;
  successMsg = '';
  errorMsg = '';

  emi: number | null = null;
  totalInterest: number | null = null;
  totalPayable: number | null = null;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private router: Router
  ) {
    this.loanForm = this.fb.group({
      clientName: ['', Validators.required],
      amount: ['', Validators.required],
      tenureMonths: ['', Validators.required],
      interestRate: ['', Validators.required],
      loanType: ['WORKING_CAPITAL', Validators.required],
      financials: this.fb.group({
        revenue: ['', Validators.required],
        ebitda: ['', Validators.required],
        rating: ['', Validators.required]
      })
    });

    this.loanForm.valueChanges.subscribe(() => this.calculateEmiPreview());
  }

  calculateEmiPreview() {
    const amount = Number(this.loanForm.get('amount')?.value);
    const tenure = Number(this.loanForm.get('tenureMonths')?.value);
    const interest = Number(this.loanForm.get('interestRate')?.value);

    if (!amount || !tenure || !interest) {
      this.emi = this.totalInterest = this.totalPayable = null;
      return;
    }

    const monthlyRate = interest / 12 / 100;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalPayable = emi * tenure;
    const totalInterest = totalPayable - amount;

    this.emi = Math.round(emi);
    this.totalPayable = Math.round(totalPayable);
    this.totalInterest = Math.round(totalInterest);
  }

  submitLoan() {
    if (this.loanForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formValue = this.loanForm.value;

    const payload: CreateLoanRequest = {
      clientName: formValue.clientName,
      requestedAmount: Number(formValue.amount),
      proposedInterestRate: Number(formValue.interestRate),
      tenureMonths: Number(formValue.tenureMonths),
      loanType: formValue.loanType.toUpperCase(),
      financials: {
        revenue: Number(formValue.financials.revenue),
        ebitda: Number(formValue.financials.ebitda),
        rating: formValue.financials.rating
      }
    };

    this.loanService.createLoan(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/loans']);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMsg = 'Loan submission failed. Please check all fields.';
      }
    });
  }

  confirmSubmitLoan() {
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to submit this loan?\n\nYou will not be able to edit it after submission.'
    );

    if (!confirmed) return;

    this.submitLoan();
  }

}
