import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authGuard } from './auth-guard';

// 🔴 Mock Angular inject()
const navigateMock = vi.fn();

vi.mock('@angular/core', () => ({
  inject: () => ({
    navigate: navigateMock
  })
}));

describe('authGuard (pure Vitest)', () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
  });

  it('should allow access when token exists', () => {
    localStorage.setItem('token', 'abc123');

    const result = authGuard({} as any, {} as any);

    expect(result).toBe(true);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should redirect to login when token does not exist', () => {
    const result = authGuard({} as any, {} as any);

    expect(result).toBe(false);
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });
});
