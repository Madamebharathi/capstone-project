import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { LoanService } from './loan.service';

describe('LoanService (Vitest Safe)', () => {
  let service: LoanService;
  let httpClientMock: any;

  const baseUrl = 'http://localhost:8080/api/loans';

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    };

    service = new LoanService(httpClientMock as HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch loans without status', () => {
    httpClientMock.get.mockReturnValue(of({}));

    service.getLoans(0, 10).subscribe();

    expect(httpClientMock.get).toHaveBeenCalledWith(
      baseUrl,
      { params: expect.anything() }
    );
  });

  it('should fetch loans with status', () => {
    httpClientMock.get.mockReturnValue(of({}));

    service.getLoans(0, 10, 'APPROVED').subscribe();

    expect(httpClientMock.get).toHaveBeenCalled();
  });

  it('should create a loan', () => {
    const payload = { amount: 50000 };
    httpClientMock.post.mockReturnValue(of({}));

    service.createLoan(payload).subscribe();

    expect(httpClientMock.post).toHaveBeenCalledWith(
      baseUrl,
      payload
    );
  });

  it('should update loan status with auth header', () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue('test-token');
    httpClientMock.patch.mockReturnValue(of({}));

    service.updateLoanStatus('123', { status: 'APPROVED' }).subscribe();

    expect(httpClientMock.patch).toHaveBeenCalledWith(
      `${baseUrl}/123/status`,
      { status: 'APPROVED' },
      expect.objectContaining({
        headers: expect.anything()
      })
    );
  });

  it('should delete loan with auth header', () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue('test-token');
    httpClientMock.delete.mockReturnValue(of({}));

    service.deleteLoan('123').subscribe();

    expect(httpClientMock.delete).toHaveBeenCalledWith(
      `${baseUrl}/123`,
      expect.objectContaining({
        headers: expect.anything()
      })
    );
  });
});
