import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../../models/user.model';
import { LoginRequestModel } from '../../models/login-request.model';
import { LoginResponseModel } from '../../models/login-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private BASE_URL = 'http://loan-backend:8081/api';
private baseUrl = 'http://loan-backend:8081/api/admin/users';


  constructor(private http: HttpClient) {}

  // ✅ Add this helper method
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
  }

  login(data: LoginRequestModel): Observable<LoginResponseModel> {
    return this.http.post<LoginResponseModel>(
      `${this.BASE_URL}/auth/login`,
      data
    );
  }

  // ✅ FIX: Add authorization header
  getMe() {
    return this.http.get<User>(`${this.BASE_URL}/users/me`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ FIX: Add authorization header
  getAllUsers() {
   return this.http.get<any[]>(`${this.BASE_URL}/admin/users`, 
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // ✅ FIX: Add authorization header
  updateUserStatus(userId: string, active: boolean) {
    return this.http.put(
      `${this.baseUrl}/${userId}/status`,
      { active },
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  // ✅ FIX: Add authorization header
  createUser(data: any) {
   return this.http.post(`${this.BASE_URL}/admin/users`, data,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
  
  logout() {
    localStorage.clear();
  }
}