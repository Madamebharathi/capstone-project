import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.css']
})
export class ManageUsersComponent implements OnInit {

  users: any[] = [];
  loading = true;

  loggedInEmail!: string;

  newUser = {
    email: '',
    password: '',
    role: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadLoggedInUser();
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;

    this.authService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadLoggedInUser() {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.loggedInEmail = user.email;
      },
      error: (err) => {
        console.error('Failed to fetch logged-in user', err);
      }
    });
  }

  /* ================= CREATE USER ================= */

  createUser() {

    if (!this.newUser.email || !this.newUser.password || !this.newUser.role) {
      alert('Please fill all fields');
      return;
    }

    const confirmed = window.confirm(
      `Create user "${this.newUser.email}" with role ${this.newUser.role}?`
    );

    if (!confirmed) {
      return;
    }

    this.authService.createUser(this.newUser).subscribe({
      next: () => {
        alert('User created successfully');

        // reset form
        this.newUser = {
          email: '',
          password: '',
          role: ''
        };

        // reload users list
        this.loadUsers();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create user');
      }
    });
  }

  /* ================= ACTIVATE / DEACTIVATE ================= */

  /* ================= ACTIVATE / DEACTIVATE ================= */

updateStatus(user: any, active: boolean) {
  this.authService.updateUserStatus(user.id, active).subscribe({
    next: () => {
      user.active = active; // update UI immediately
      alert(`User ${active ? 'activated' : 'deactivated'} successfully`);
    },
    error: (err) => {
      console.error(err);
      alert(err.error?.message || 'Failed to update user status');
    }
  });
}

confirmToggle(user: any, activate: boolean) {
  const actionText = activate ? 'activate' : 'deactivate';
  const confirmed = window.confirm(
    `Are you sure you want to ${actionText} user "${user.email}"?`
  );

  if (!confirmed) return;

  this.updateStatus(user, activate);
}
}