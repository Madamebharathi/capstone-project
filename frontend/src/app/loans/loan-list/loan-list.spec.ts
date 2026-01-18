import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { LoanListComponent } from './loan-list';
import { LoanService } from '../../core/services/loan.service';
import { Router } from '@angular/router';

describe('LoanListComponent (PURE Vitest)', () => {
  let component: LoanListComponent;

  let loanServiceMock: {
    getLoans: ReturnType<typeof vi.fn>;
    updateLoanStatus: ReturnType<typeof vi.fn>;
    deleteLoan: ReturnType<typeof vi.fn>;
  };

  let routerMock: { url: string };

  beforeEach(() => {
    loanServiceMock = {
      getLoans: vi.fn(),
      updateLoanStatus: vi.fn(),
      deleteLoan: vi.fn()
    };

    // ✅ DEFAULT SAFE MOCK (CRITICAL FIX)
    loanServiceMock.getLoans.mockReturnValue(
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
        first: true,
        last: true,
        empty: true
      })
    );

    routerMock = {
      url: '/dashboard/loans'
    };

    component = new LoanListComponent(
      loanServiceMock as unknown as LoanService,
      routerMock as Router
    );

    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should detect admin based on router url', () => {
    routerMock.url = '/admin/review-loans';

    component.ngOnInit();

    expect(component.isAdmin).toBe(true);
  });

  it('should load loans on init', () => {
    loanServiceMock.getLoans.mockReturnValue(
      of({
        content: [{ id: '1' } as any],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10,
        first: true,
        last: true,
        empty: false
      })
    );

    component.ngOnInit();

    expect(loanServiceMock.getLoans).toHaveBeenCalled();
    expect(component.loans.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading loans fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    loanServiceMock.getLoans.mockReturnValue(
      throwError(() => new Error('API error'))
    );

    component.loadLoans();

    expect(component.loading).toBe(false);
  });

  it('should submit loan and reload list', () => {
    loanServiceMock.updateLoanStatus.mockReturnValue(of({}));

    component.submitLoan('123');

    expect(loanServiceMock.updateLoanStatus).toHaveBeenCalledWith('123', {
      status: 'SUBMITTED',
      comments: 'Submitted by user'
    });
  });

  it('should approve loan after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    loanServiceMock.updateLoanStatus.mockReturnValue(of({}));

    component.confirmApprove('123');

    expect(loanServiceMock.updateLoanStatus).toHaveBeenCalledWith('123', {
      status: 'APPROVED',
      comments: 'Approved by admin'
    });
  });

  it('should not approve loan when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.confirmApprove('123');

    expect(loanServiceMock.updateLoanStatus).not.toHaveBeenCalled();
  });

  it('should delete loan after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    loanServiceMock.deleteLoan.mockReturnValue(of({}));

    component.confirmDelete('123');

    expect(loanServiceMock.deleteLoan).toHaveBeenCalledWith('123');
  });

  it('should not delete loan if confirmation cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.confirmDelete('123');

    expect(loanServiceMock.deleteLoan).not.toHaveBeenCalled();
  });
});
