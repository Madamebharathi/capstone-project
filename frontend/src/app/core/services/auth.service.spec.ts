import { describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';

describe('AuthService (pure Vitest)', () => {
  let service: AuthService;
  let httpClientMock: HttpClient;

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn(),
      get: vi.fn()
    } as unknown as HttpClient;

    service = new AuthService(httpClientMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user', () => {
    const mockResponse = { token: 'abc123' };
    (httpClientMock.post as any).mockReturnValue(of(mockResponse));

    service.login({ email: 'a@test.com', password: '123' }).subscribe(res => {
      expect(res.token).toBe('abc123');
    });
  });

  it('should fetch logged-in user', () => {
    const mockUser = { email: 'a@test.com', role: 'USER' };
    (httpClientMock.get as any).mockReturnValue(of(mockUser));

    service.getMe().subscribe(user => {
      expect(user.email).toBe('a@test.com');
    });
  });

  it('should clear localStorage on logout', () => {
  localStorage.setItem('token', 'abc123');

  service.logout();

  expect(localStorage.getItem('token')).toBeNull();
});

});
