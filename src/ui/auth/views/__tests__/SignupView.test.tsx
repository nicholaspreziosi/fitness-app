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
import { SignupView } from '@/src/ui/auth/views/SignupView';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;

describe('SignupView', () => {
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
    render(<SignupView />);

    expect(useAuthMock).toHaveBeenCalled();
  });

  it('shows friendly AuthError messages from sign up failures', async () => {
    const signUp = jest.fn().mockRejectedValue(
      new AuthError('An account with this email already exists.', 'email_in_use')
    );
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp,
      signOut: jest.fn(),
    });

    render(<SignupView />);

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'you@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('At least 6 characters'), 'secret123');
    fireEvent.changeText(screen.getByPlaceholderText('Re-enter your password'), 'secret123');
    fireEvent.press(screen.getByText('Create account'));

    await waitFor(() => {
      expect(screen.getByText('An account with this email already exists.')).toBeTruthy();
    });
  });

  it('shows a generic friendly message for unexpected sign up failures', async () => {
    const signUp = jest.fn().mockRejectedValue(new Error('FirebaseError: internal'));
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp,
      signOut: jest.fn(),
    });

    render(<SignupView />);

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'you@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('At least 6 characters'), 'secret123');
    fireEvent.changeText(screen.getByPlaceholderText('Re-enter your password'), 'secret123');
    fireEvent.press(screen.getByText('Create account'));

    await waitFor(() => {
      expect(screen.getByText('Unable to create account.')).toBeTruthy();
    });
  });
});
