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

  // ✅ ONE base URL ONLY
  private BASE_URL = '/api';
  private baseUrl = '/api/admin/users';

  constructor(private http: HttpClient) {}

  // Auth header helper
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
  }

  // LOGIN
  login(data: LoginRequestModel): Observable<LoginResponseModel> {
    return this.http.post<LoginResponseModel>(
      `${this.BASE_URL}/auth/login`,
      data
    );
  }

  // GET CURRENT USER
  getMe() {
    return this.http.get<User>(
      `${this.BASE_URL}/users/me`,
      { headers: this.getAuthHeaders() }
    );
  }

  // GET ALL USERS (ADMIN)
  getAllUsers() {
    return this.http.get<any[]>(
      `${this.BASE_URL}/admin/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  // UPDATE USER STATUS
  updateUserStatus(userId: string, active: boolean) {
    return this.http.put(
      `${this.BASE_URL}/admin/users/${userId}/status`,
      { active },
      { headers: this.getAuthHeaders() }
    );
  }

  // CREATE USER
  createUser(data: any) {
    return this.http.post(
      `${this.BASE_URL}/admin/users`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  logout() {
    localStorage.clear();
  }
}
