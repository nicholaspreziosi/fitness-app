import { authService } from '@/src/contexts/auth/application/auth.service';
import { AuthProvider, useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

jest.mock('@/src/contexts/auth/application/auth.service', () => {
  const { AuthError } = jest.requireActual('@/src/contexts/auth/domain/auth.model');

  return {
    authService: {
      onAuthStateChanged: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    AuthError,
  };
});

const authServiceMock = authService as jest.Mocked<typeof authService>;

describe('AuthProvider', () => {
  let authStateListener: ((user: { id: string; email: string | null } | null) => void) | null =
    null;

  beforeEach(() => {
    authStateListener = null;
    jest.clearAllMocks();

    authServiceMock.onAuthStateChanged.mockImplementation((callback) => {
      authStateListener = callback;
      return jest.fn();
    });
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  it('exposes loading, user, signIn, signUp, and signOut', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.signOut).toBe('function');

    act(() => {
      authStateListener?.(null);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('updates user after sign in', async () => {
    const nextUser = { id: 'user-123', email: 'you@example.com' };
    authServiceMock.signIn.mockResolvedValue(nextUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateListener?.(null);
    });

    await act(async () => {
      await result.current.signIn('you@example.com', 'secret');
    });

    expect(authServiceMock.signIn).toHaveBeenCalledWith('you@example.com', 'secret');
    expect(result.current.user).toEqual(nextUser);
  });

  it('updates user after sign up', async () => {
    const nextUser = { id: 'user-123', email: 'you@example.com' };
    authServiceMock.signUp.mockResolvedValue(nextUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateListener?.(null);
    });

    await act(async () => {
      await result.current.signUp('you@example.com', 'secret');
    });

    expect(authServiceMock.signUp).toHaveBeenCalledWith('you@example.com', 'secret');
    expect(result.current.user).toEqual(nextUser);
  });

  it('clears user after sign out', async () => {
    const nextUser = { id: 'user-123', email: 'you@example.com' };
    authServiceMock.signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateListener?.(nextUser);
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(nextUser);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(authServiceMock.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it('requires AuthProvider for useAuth', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider.'
    );
  });
});
