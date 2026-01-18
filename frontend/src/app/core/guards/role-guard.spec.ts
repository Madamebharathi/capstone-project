import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError, firstValueFrom, Observable } from 'rxjs';
import { roleGuard } from './role-guard';

// ------------------ MOCKS ------------------
const navigateMock = vi.fn();
const getMeMock = vi.fn();

// PARTIAL MOCK (THIS IS THE FIX)
vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<any>();

  return {
    ...actual, // 👈 keep Injectable, signals, etc.
    inject: (token: any) => {
      if (token?.name === 'AuthService') {
        return { getMe: getMeMock };
      }
      return { navigate: navigateMock };
    }
  };
});

// ------------------ TESTS ------------------
describe('roleGuard (pure Vitest)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow access when role is allowed', async () => {
    getMeMock.mockReturnValue(
      of({ email: 'a@test.com', role: 'ADMIN' })
    );

    const route: any = {
      data: { roles: ['ADMIN'] }
    };

    const result$ =
      roleGuard(route, {} as any) as Observable<boolean>;

    const result = await firstValueFrom(result$);

    expect(result).toBe(true);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should deny access when role is not allowed', async () => {
    getMeMock.mockReturnValue(
      of({ email: 'a@test.com', role: 'USER' })
    );

    const route: any = {
      data: { roles: ['ADMIN'] }
    };

    const result$ =
      roleGuard(route, {} as any) as Observable<boolean>;

    const result = await firstValueFrom(result$);

    expect(result).toBe(false);
    expect(navigateMock).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should redirect to login when getMe throws error', async () => {
    getMeMock.mockReturnValue(
      throwError(() => new Error('401'))
    );

    const route: any = {
      data: { roles: ['ADMIN'] }
    };

    const result$ =
      roleGuard(route, {} as any) as Observable<boolean>;

    const result = await firstValueFrom(result$);

    expect(result).toBe(false);
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });
});
