import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { LoanListComponent } from './loans/loan-list/loan-list';
import { ApplyLoanComponent } from './loans/apply-loan/apply-loan';
import { EditLoanComponent } from './loans/edit-loan/edit-loan';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { DashboardComponent } from './dashboard/dashboard.component/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: Login },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      // USER routes
      { path: 'loans', component: LoanListComponent },
      { path: 'apply-loan', component: ApplyLoanComponent },
      
      // ✅ IMPORTANT: Edit route MUST come BEFORE details route
      { path: 'loans/:id/edit', component: EditLoanComponent },
      
      {
        path: 'loans/:id',
        loadComponent: () =>
          import('./loans/loan-details/loan-details')
            .then(m => m.LoanDetailsComponent)
      },

      // ADMIN routes
      {
        path: 'review-loans',
        component: LoanListComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/manage-users/manage-users')
            .then(m => m.ManageUsersComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];