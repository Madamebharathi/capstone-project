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

  private baseUrl = 'http://localhost:8081/api/loans';

  constructor(private http: HttpClient) {}

  getLoanById(id: string) {
  const token = localStorage.getItem('token') || '';
  return this.http.get<Loan>(`${this.baseUrl}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

  // GET paginated loans
 // GET paginated loans
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
    // ✅ CALL FILTER API
    url = `${this.baseUrl}/status/${status}`;
  } else {
    // ✅ CALL NORMAL PAGINATION
    url = `${this.baseUrl}/paginated`;
  }

  console.log('🌐 API CALL:', url, 'params:', params.toString());

  return this.http.get<PageResponse<Loan>>(url, { params });
}

  // CREATE loan
  createLoan(payload: CreateLoanRequest): Observable<Loan> {
    return this.http.post<Loan>(this.baseUrl, payload);
  }

  // SUBMIT loan (USER)
  submitLoan(id: string): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/${id}/submit`, {});
  }

  // MARK UNDER REVIEW (ADMIN)
  markUnderReview(id: string): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/${id}/under-review`, {});
  }

  // APPROVE loan (ADMIN)
  approveLoan(id: string): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/${id}/approve`, {});
  }

  // REJECT loan (ADMIN)
  rejectLoan(id: string, rejectionReason: string): Observable<Loan> {
    return this.http.patch<Loan>(
      `${this.baseUrl}/${id}/reject`,
      { rejectionReason }
    );
  }

  // UPDATE loan (USER edits DRAFT only)
  updateLoan(id: string, payload: Partial<Loan>): Observable<Loan> {
    return this.http.put<Loan>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE loan (ADMIN)
  deleteLoan(id: string): Observable<Loan> {
  const token = localStorage.getItem('token') || '';
  return this.http.delete<Loan>(`${this.baseUrl}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
}
