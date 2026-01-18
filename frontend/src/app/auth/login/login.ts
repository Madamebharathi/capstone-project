import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    localStorage.clear();
    
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        console.log('Login response:', res); // Debug log
        
        // Step 1: Save token FIRST
        localStorage.setItem('token', res.token);

        // Step 2: NOW fetch user info with the token
        this.authService.getMe().subscribe({
          next: (user) => {
            console.log('User info:', user); // Debug log
            
            localStorage.setItem('email', user.email);
            localStorage.setItem('role', user.role);

            // Step 3: Route based on role
            if (user.role === 'ADMIN') {
              this.router.navigate(['/dashboard'], { queryParams: { role: 'ADMIN' } });
            } else {
              this.router.navigate(['/dashboard'], { queryParams: { role: 'USER' } });
            }
          },
          error: (err) => {
            console.error('Failed to get user info:', err);
            alert('Failed to load user information');
          }
        });
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Invalid credentials');
      }
    });
  }
}