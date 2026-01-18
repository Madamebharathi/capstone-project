import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';

describe('DashboardComponent (PURE Vitest)', () => {
  let component: DashboardComponent;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // clear storage before each test
    localStorage.clear();

    routerMock = {
      navigate: vi.fn()
    };

    component = new DashboardComponent(routerMock as unknown as Router);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load email and role from localStorage on init', () => {
    localStorage.setItem('email', 'test@example.com');
    localStorage.setItem('role', 'ADMIN');

    component.ngOnInit();

    expect(component.email).toBe('test@example.com');
    expect(component.role).toBe('ADMIN');
  });

  it('should set empty values if localStorage is empty', () => {
    component.ngOnInit();

    expect(component.email).toBe('');
    expect(component.role).toBe('');
  });

  it('should clear localStorage and navigate to login on logout', () => {
    localStorage.setItem('email', 'x@test.com');
    localStorage.setItem('role', 'USER');

    component.logout();

    expect(localStorage.getItem('email')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
