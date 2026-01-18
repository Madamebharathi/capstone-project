import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../core/services/loan.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  email = '';
  role = '';
  userName = '';
  
  stats = {
    total: 0,
    draft: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  };
  
  loading = true;
  isDashboard = false;
  
  private routerSubscription?: Subscription;

  constructor(
    public router: Router,
    private loanService: LoanService
  ) {}

  ngOnInit() {
    this.email = localStorage.getItem('email') || '';
    this.role = localStorage.getItem('role') || '';
    this.userName = this.email.split('@')[0];
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isDashboard = this.router.url === '/dashboard';
      });

    this.loadStatistics();
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  loadStatistics() {
    this.loading = true;
    
    this.loanService.getLoans(0, 1000).subscribe({
      next: (res) => {
        const loans = res.content;
        
        this.stats.total = loans.length;
        this.stats.draft = loans.filter(l => l.status === 'DRAFT').length;
        this.stats.submitted = loans.filter(l => l.status === 'SUBMITTED').length;
        this.stats.underReview = loans.filter(l => l.status === 'UNDER_REVIEW').length;
        this.stats.approved = loans.filter(l => l.status === 'APPROVED').length;
        this.stats.rejected = loans.filter(l => l.status === 'REJECTED').length;
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.loading = false;
      }
    });
  }

  filterBy(status: string): void {
    if (status === 'ALL') {
      this.router.navigate([
        this.role === 'ADMIN'
          ? '/dashboard/review-loans'
          : '/dashboard/loans'
      ]);
    } else {
      this.router.navigate(
        [
          this.role === 'ADMIN'
            ? '/dashboard/review-loans'
            : '/dashboard/loans'
        ],
        { queryParams: { status } }
      );
    }
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }
}