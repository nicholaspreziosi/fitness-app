import { AuthRootNavigator } from '@/src/ui/shared/providers/AuthRootNavigator';
import { render, screen } from '@testing-library/react-native';
import * as React from 'react';

const routeGuards: boolean[] = [];

jest.mock('expo-router', () => ({
  Stack: Object.assign(({ children }: { children: React.ReactNode }) => children, {
    Protected: ({ guard, children }: { guard: boolean; children: React.ReactNode }) => {
      routeGuards.push(guard);
      return guard ? children : null;
    },
    Screen: () => null,
  }),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

jest.mock('@/src/ui/shared/hooks/useAppSplash', () => ({
  useAppSplash: jest.fn(),
}));

jest.mock('@/src/ui/shared/hooks/useAuthColorScheme', () => ({
  useAuthColorScheme: jest.fn(() => 'light'),
}));

jest.mock('@/src/ui/shared/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

import { useAppSplash } from '@/src/ui/shared/hooks/useAppSplash';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';

const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;
const useAppSplashMock = useAppSplash as jest.MockedFunction<typeof useAppSplash>;

describe('AuthRootNavigator', () => {
  beforeEach(() => {
    routeGuards.length = 0;
    jest.clearAllMocks();
    useAppSplashMock.mockReturnValue({
      onSplashReady: jest.fn(),
      showSplash: false,
    });
  });

  it('shows the splash screen while startup is in progress', () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
    useAppSplashMock.mockReturnValue({
      onSplashReady: jest.fn(),
      showSplash: true,
    });

    render(<AuthRootNavigator />);

    expect(screen.getByTestId('splash-screen')).toBeTruthy();
    expect(routeGuards).toHaveLength(0);
  });

  it('protects app routes for authenticated users', () => {
    useAuthMock.mockReturnValue({
      user: { id: 'user-123', email: 'you@example.com' },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    render(<AuthRootNavigator />);

    expect(routeGuards).toEqual([true, false]);
  });

  it('protects auth routes for unauthenticated users', () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    render(<AuthRootNavigator />);

    expect(routeGuards).toEqual([false, true]);
  });
});
