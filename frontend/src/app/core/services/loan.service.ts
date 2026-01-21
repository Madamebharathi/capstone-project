import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan, LoanStatus } from '../../models/loan.model';
import { PageResponse } from '../../models/page-response.model';
import { CreateLoanRequest } from '../../models/create-loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  // FIXED BASE URL
  private baseUrl = '/api/loans';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
  }

  // GET loan by ID
  getLoanById(id: string) {
    return this.http.get<Loan>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // GET loans (paginated OR filtered by status)
  getLoans(
    page = 0,
    size = 10,
    status?: LoanStatus
  ): Observable<PageResponse<Loan>> {

    let url = '';
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      url = `${this.baseUrl}/status/${status}`;
    } else {
      url = `${this.baseUrl}/paginated`;
    }

    console.log('🌐 API CALL:', url, 'params:', params.toString());

    return this.http.get<PageResponse<Loan>>(url, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  // CREATE loan
  createLoan(payload: CreateLoanRequest): Observable<Loan> {
    return this.http.post<Loan>(
      this.baseUrl,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // SUBMIT loan (USER)
  submitLoan(id: string): Observable<Loan> {
    return this.http.patch<Loan>(
      `${this.baseUrl}/${id}/submit`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // MARK UNDER REVIEW (ADMIN)
  markUnderReview(id: string): Observable<Loan> {
    return this.http.patch<Loan>(
      `${this.baseUrl}/${id}/under-review`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // APPROVE loan (ADMIN)
  approveLoan(id: string): Observable<Loan> {
    return this.http.patch<Loan>(
      `${this.baseUrl}/${id}/approve`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // REJECT loan (ADMIN)
  rejectLoan(id: string, rejectionReason: string): Observable<Loan> {
    return this.http.patch<Loan>(
      `${this.baseUrl}/${id}/reject`,
      { rejectionReason },
      { headers: this.getAuthHeaders() }
    );
  }

  // UPDATE loan (USER edits DRAFT only)
  updateLoan(id: string, payload: Partial<Loan>): Observable<Loan> {
    return this.http.put<Loan>(
      `${this.baseUrl}/${id}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // DELETE loan (ADMIN)
  deleteLoan(id: string): Observable<Loan> {
    return this.http.delete<Loan>(
      `${this.baseUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
