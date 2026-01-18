import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LoanService } from '../../core/services/loan.service';
import { Loan, LoanStatus } from '../../models/loan.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-loan-list',
  templateUrl: './loan-list.html',
  styleUrls: ['./loan-list.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LoanListComponent implements OnInit {

  loans: Loan[] = [];
  loading = false;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  statusFilter?: LoanStatus;
  isAdmin = false;

  constructor(
    private loanService: LoanService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.isAdmin = localStorage.getItem('role') === 'ADMIN';

    //READ STATUS FROM STAT CARDS (QUERY PARAMS)
    this.route.queryParams.subscribe(params => {
      const status = params['status'];

      this.page = 0; // always reset pagination on filter change

      if (status) {
        this.statusFilter = status as LoanStatus;
      } else {
        this.statusFilter = undefined;
      }

      this.loadLoans();   //ONLY ONE PLACE LOAD HAPPENS
    });
  }

  // ================= LOAD LOANS =================
  loadLoans() {
    this.loading = true;
    console.log('Loading loans... Page:', this.page, 'Status:', this.statusFilter);

    this.loanService.getLoans(this.page, this.size, this.statusFilter).subscribe({
      next: (res) => {
        console.log('Loans loaded:', res);
       this.loans = this.isAdmin
  ? res.content
  : res.content.filter(loan => !loan.deleted);

        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading loans:', err);
        this.loading = false;
      }
    });
  }

  // ================= PAGINATION =================
  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadLoans();
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadLoans();
    }
  }

  // ================= NAVIGATION =================
  openLoanDetails(loanId: string) {
    this.router.navigate(['/dashboard/loans', loanId]);
  }

  editLoan(loan: Loan) {
    this.router.navigate(['/dashboard/loans', loan.id, 'edit']);
  }

  canEditLoan(loan: Loan): boolean {
    return !this.isAdmin && loan.status === LoanStatus.DRAFT;
  }
  canDeleteLoan(loan: Loan): boolean {
  return this.isAdmin;
}

  // ================= ACTIONS =================
  submitLoan(id: string) {
    this.loanService.submitLoan(id).subscribe({
      next: () => {
        console.log('Loan submitted');
        this.page = 0;
        this.loadLoans();   //keeps same filter
      },
      error: (err) => console.error('Submit failed:', err)
    });
  }

  markUnderReview(id: string) {
    this.loanService.markUnderReview(id).subscribe({
      next: () => {
        this.page = 0;
        this.loadLoans();   //keeps same filter
      },
      error: (err) => console.error(err)
    });
  }

  approveLoan(id: string) {
    this.loanService.approveLoan(id).subscribe({
      next: () => {
        this.page = 0;
        this.loadLoans();   //keeps same filter
      },
      error: (err) => console.error(err)
    });
  }

  rejectLoan(id: string, reason: string) {
    this.loanService.rejectLoan(id, reason).subscribe({
      next: () => {
        this.page = 0;
        this.loadLoans();   //keeps same filter
      },
      error: (err) => console.error(err)
    });
  }

  deleteLoan(id: string) {
  this.loanService.deleteLoan(id).subscribe({
    next: () => {
      this.page = 0;
      this.loadLoans();
      alert('Loan deleted successfully!');
    },
    error: (err: any) => {
      console.error('Delete loan failed', err);
      alert('Failed to delete loan.');
    }
  });
}

  // ================= CONFIRM POPUPS =================
  confirmSubmit(id: string) {
    if (confirm('Submit this loan?')) this.submitLoan(id);
  }

  confirmReview(id: string) {
    if (confirm('Move this loan to review?')) this.markUnderReview(id);
  }

  confirmApprove(id: string) {
    if (confirm('Approve this loan?')) this.approveLoan(id);
  }

  confirmReject(id: string) {
    const reason = prompt('Enter rejection reason:');
    if (reason) this.rejectLoan(id, reason);
  }

  confirmDelete(id: string) {
    if (confirm('Delete this loan?')) this.deleteLoan(id);
  }
}
