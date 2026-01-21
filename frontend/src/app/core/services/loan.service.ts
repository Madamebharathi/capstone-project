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

  // ✅ CHANGED: Use relative URL - works with Nginx proxy
  private baseUrl = '/api/loans';

  constructor(private http: HttpClient) {}

  getLoanById(id: string) {
    const token = localStorage.getItem('token') || '';
    return this.http.get<Loan>(`${this.baseUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

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

    return this.http.get<PageResponse<Loan>>(url, { params });
  }

  createLoan(payload: CreateLoanRequest): Observable<Loan> {
    return this.http.post<Loan>(this.baseUrl, payload);
  }

  submitLoan(id: string): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/${id}/submit`, {});
  }

  markUnderReview(id: string): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/${id}/under-review`, {});
  }

  approveLoan(id: string): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectLoan(id: string, rejectionReason: string): Observable<Loan> {
    return this.http.patch<Loan>(
      `${this.baseUrl}/${id}/reject`,
      { rejectionReason }
    );
  }

  updateLoan(id: string, payload: Partial<Loan>): Observable<Loan> {
    return this.http.put<Loan>(`${this.baseUrl}/${id}`, payload);
  }

  deleteLoan(id: string): Observable<Loan> {
    const token = localStorage.getItem('token') || '';
    return this.http.delete<Loan>(`${this.baseUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}