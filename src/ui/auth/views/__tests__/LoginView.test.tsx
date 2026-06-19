jest.mock('@/src/ui/shared/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/src/ui/auth/components/AuthSplitLayout', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    AuthSplitLayout: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    AuthFormMessage: ({ message }: { message: string }) => <Text>{message}</Text>,
  };
});

import { AuthError } from '@/src/contexts/auth/domain/auth.model';
import { LoginView } from '@/src/ui/auth/views/LoginView';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
  });

  it('uses useAuth instead of Firebase directly', () => {
    render(<LoginView />);

    expect(useAuthMock).toHaveBeenCalled();
  });

  it('shows a friendly validation message for empty fields', async () => {
    render(<LoginView />);

    fireEvent.press(screen.getByText('Sign in'));

    expect(await screen.findByText('Enter your email and password.')).toBeTruthy();
  });

  it('shows friendly AuthError messages from sign in failures', async () => {
    const signIn = jest.fn().mockRejectedValue(
      new AuthError('Invalid email or password.', 'invalid_credentials')
    );
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      signIn,
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    render(<LoginView />);

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'you@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Your password'), 'wrong');
    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeTruthy();
    });
  });

  it('shows a generic friendly message for unexpected sign in failures', async () => {
    const signIn = jest.fn().mockRejectedValue(new Error('FirebaseError: internal'));
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      signIn,
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    render(<LoginView />);

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'you@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Your password'), 'secret');
    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Unable to sign in.')).toBeTruthy();
    });
  });
});
