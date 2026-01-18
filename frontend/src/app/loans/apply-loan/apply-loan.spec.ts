import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { ApplyLoanComponent } from './apply-loan';
import { LoanService } from '../../core/services/loan.service';
import { Router } from '@angular/router';

describe('ApplyLoanComponent (PURE Vitest)', () => {
  let component: ApplyLoanComponent;

  const loanServiceMock = {
    createLoan: vi.fn()
  };

  const routerMock = {
    navigate: vi.fn()
  };

  beforeEach(() => {
    component = new ApplyLoanComponent(
      new FormBuilder(),
      loanServiceMock as unknown as LoanService,
      routerMock as unknown as Router
    );
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate EMI preview when form values change', () => {
    component.loanForm.patchValue({
      amount: 100000,
      tenureMonths: 12,
      interestRate: 12
    });

    component.calculateEmiPreview();

    expect(component.emi).not.toBeNull();
    expect(component.totalPayable).not.toBeNull();
    expect(component.totalInterest).not.toBeNull();
  });

  it('should reset EMI preview when values are missing', () => {
    component.loanForm.patchValue({
      amount: null,
      tenureMonths: null,
      interestRate: null
    });

    component.calculateEmiPreview();

    expect(component.emi).toBeNull();
    expect(component.totalPayable).toBeNull();
    expect(component.totalInterest).toBeNull();
  });

  it('should not submit when form is invalid', () => {
    component.submitLoan();
    expect(loanServiceMock.createLoan).not.toHaveBeenCalled();
  });

  it('should submit loan and navigate on success', () => {
    loanServiceMock.createLoan.mockReturnValue(of({}));

    component.loanForm.patchValue({
      clientName: 'Test',
      amount: 50000,
      tenureMonths: 12,
      interestRate: 10,
      loanType: 'WorkingCapital',
      financials: {
        revenue: 100000,
        ebitda: 20000,
        rating: 'A'
      }
    });

    component.submitLoan();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/loans']);
  });

  it('should show error message on submission failure', () => {
    loanServiceMock.createLoan.mockReturnValue(
      throwError(() => new Error('API error'))
    );

    component.loanForm.patchValue({
      clientName: 'Test',
      amount: 50000,
      tenureMonths: 12,
      interestRate: 10,
      loanType: 'WorkingCapital',
      financials: {
        revenue: 100000,
        ebitda: 20000,
        rating: 'A'
      }
    });

    component.submitLoan();

    expect(component.errorMsg).toBe('Loan submission failed');
  });

  it('should not proceed when confirm dialog is cancelled', () => {
  vi.clearAllMocks(); // ⭐ IMPORTANT

  vi.spyOn(window, 'confirm').mockReturnValue(false);

  component.loanForm.setValue({
    clientName: 'Test',
    amount: 50000,
    tenureMonths: 12,
    interestRate: 10,
    loanType: 'WorkingCapital',
    financials: {
      revenue: 100000,
      ebitda: 20000,
      rating: 'A'
    }
  });

  component.confirmSubmitLoan();

  expect(loanServiceMock.createLoan).not.toHaveBeenCalled();
});


  it('should submit when confirm dialog is accepted', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    loanServiceMock.createLoan.mockReturnValue(of({}));

    component.loanForm.patchValue({
      clientName: 'Test',
      amount: 50000,
      tenureMonths: 12,
      interestRate: 10,
      loanType: 'WorkingCapital',
      financials: {
        revenue: 100000,
        ebitda: 20000,
        rating: 'A'
      }
    });

    component.confirmSubmitLoan();

    expect(loanServiceMock.createLoan).toHaveBeenCalled();
  });
});
