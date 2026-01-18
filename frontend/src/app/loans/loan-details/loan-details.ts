import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Loan, LoanStatus } from '../../models/loan.model';
import { LoanService } from '../../core/services/loan.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-details.html',
  styleUrls: ['./loan-details.css']
})
export class LoanDetailsComponent implements OnInit {

  loan!: Loan;
  loading = true;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  this.checkRole();

  // Subscribe to route param changes
  this.route.params.subscribe(params => {
    const loanId = params['id'];
    if (!loanId) {
      this.router.navigate(['/dashboard/loans']);
      return;
    }
    this.loadLoan(loanId); // load loan every time id changes
  });
}


  checkRole() {
    this.authService.getMe().subscribe(user => {
      this.isAdmin = user.role === 'ADMIN';
    });
  }

  loadLoan(id: string) {
  this.loading = true;
  this.loanService.getLoanById(id).subscribe({
    next: (res) => {
      this.loan = res;
      this.loading = false;
    },
    error: () => {
      this.loading = false;
      this.router.navigate(['/dashboard/loans']);
    }
  });
}

  /* ================= ACTIONS ================= */

  submitLoan() {
    if (!confirm('Submit this loan for approval?')) return;
    this.loanService.submitLoan(this.loan.id).subscribe(() => {
      this.loan.status = LoanStatus.SUBMITTED;
    });
  }

  markUnderReview() {
    if (!confirm('Move loan to UNDER REVIEW?')) return;
    this.loanService.markUnderReview(this.loan.id).subscribe(() => {
      this.loan.status = LoanStatus.UNDER_REVIEW;
    });
  }

  approveLoan() {
    if (!confirm('Approve this loan?')) return;
    this.loanService.approveLoan(this.loan.id).subscribe(() => {
      this.loan.status = LoanStatus.APPROVED;
    });
  }

  rejectLoan() {
    const reason = prompt('Enter rejection reason');
    if (!reason) return;
    this.loanService.rejectLoan(this.loan.id, reason).subscribe(() => {
      this.loan.status = LoanStatus.REJECTED;
      this.loan.rejectionReason = reason;
    });
  }
}
    