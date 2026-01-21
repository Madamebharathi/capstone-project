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

  // ✅ CHANGED: Use relative URLs
  private BASE_URL = '/api';
  private baseUrl = '/api/admin/users';

  constructor(private http: HttpClient) {}

  // ✅ Helper method for auth headers
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

  // ✅ CHANGED: Use relative URL
  getMe() {
    return this.http.get<User>('/api/users/me', {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ CHANGED: Use relative URL
  getAllUsers() {
    return this.http.get<any[]>('/api/admin/users', {
      headers: this.getAuthHeaders()
    });
  }

  updateUserStatus(userId: string, active: boolean) {
    return this.http.put(
      `${this.baseUrl}/${userId}/status`,
      { active },
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  createUser(data: any) {
    return this.http.post(
      '/api/admin/users',
      data,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
  
  logout() {
    localStorage.clear();
  }
}