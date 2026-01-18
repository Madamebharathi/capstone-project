import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';
import { Loan, LoanStatus } from '../../models/loan.model';

@Component({
  selector: 'app-edit-loan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-loan.html',
  styleUrls: ['./edit-loan.css']
})
export class EditLoanComponent implements OnInit {

  loan!: Loan;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService
  ) {
    console.log('✅ EditLoanComponent constructor called');
  }

  ngOnInit() {
    console.log('✅ ngOnInit called');
    const loanId = this.route.snapshot.paramMap.get('id');
    console.log('✅ Loan ID from route:', loanId);
    
    if (!loanId) {
      console.log('❌ No loan ID found, redirecting...');
      this.router.navigate(['/dashboard/loans']);
      return;
    }
    this.loadLoan(loanId);
  }

  loadLoan(id: string) {
    console.log('✅ loadLoan called with ID:', id);
    this.loanService.getLoanById(id).subscribe({
      next: (loan) => {
        console.log('✅ Loan loaded successfully:', loan);
        console.log('✅ Loan status:', loan.status);
        this.loan = { ...loan }; // clone for edit
        this.loading = false;
        console.log('✅ Can edit?', this.canEdit());
      },
      error: (err) => {
        console.error('❌ Error loading loan:', err);
        alert('Loan not found');
        this.router.navigate(['/dashboard/loans']);
      }
    });
  }

  // Only allow save if loan is in DRAFT
  canEdit(): boolean {
    const result = this.loan && this.loan.status === LoanStatus.DRAFT;
    console.log('canEdit() called - loan:', this.loan, 'result:', result);
    return result;
  }

  saveLoan() {
    console.log('✅ saveLoan called');
    console.log('Current loan data:', this.loan);
    
    if (!this.canEdit()) {
      alert('Cannot edit loan after submission');
      return;
    }

    this.loanService.updateLoan(this.loan.id, this.loan).subscribe({
      next: (updated) => {
        console.log('✅ Loan updated successfully:', updated);
        alert('Loan updated successfully!');
        this.router.navigate(['/dashboard/loans']);
      },
      error: (err) => {
        console.error('❌ Update failed:', err);
        alert('Failed to update loan.');
      }
    });
  }

  cancel() {
    console.log('✅ Cancel clicked');
    this.router.navigate(['/dashboard/loans']);
  }
}