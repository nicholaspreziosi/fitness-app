import { AuthError } from '@/src/contexts/auth/domain/auth.model';
import {
  mapFirebaseAuthError,
  mapFirebaseUser,
} from '@/src/contexts/auth/infrastructure/auth.mapper';
import { createMockFirebaseUser } from '@/test-utils/firebaseAuthManualMock';

describe('auth mapper', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps Firebase user to AuthUser', () => {
    expect(mapFirebaseUser(createMockFirebaseUser() as never)).toEqual({
      id: 'user-123',
      email: 'you@example.com',
    });
  });

  it.each([
    ['auth/invalid-email', 'Enter a valid email address.', 'invalid_email'],
    ['auth/invalid-credential', 'Invalid email or password.', 'invalid_credentials'],
    ['auth/wrong-password', 'Invalid email or password.', 'invalid_credentials'],
    ['auth/user-not-found', 'Invalid email or password.', 'invalid_credentials'],
    ['auth/email-already-in-use', 'An account with this email already exists.', 'email_in_use'],
    ['auth/weak-password', 'Password must be at least 6 characters.', 'weak_password'],
    ['auth/network-request-failed', 'Unable to connect. Check your network and try again.', 'network'],
    [
      'auth/operation-not-allowed',
      'Email/password sign-in is disabled in Firebase. Enable it under Authentication → Sign-in method.',
      'unknown',
    ],
    [
      'auth/unauthorized-domain',
      'This app domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.',
      'unknown',
    ],
    [
      'auth/invalid-api-key',
      'Firebase configuration looks invalid. Double-check your .env values and restart the dev server.',
      'missing_config',
    ],
    ['auth/too-many-requests', 'Too many attempts. Wait a moment and try again.', 'unknown'],
  ] as const)(
    'maps %s to friendly AuthError',
    (code, message, errorCode) => {
      const error = mapFirebaseAuthError({ code });

      expect(error).toBeInstanceOf(AuthError);
      expect(error.message).toBe(message);
      expect(error.code).toBe(errorCode);
    }
  );

  it('maps unknown Firebase errors to a generic message', () => {
    const error = mapFirebaseAuthError({ code: 'auth/internal-error' });

    expect(error.message).toBe('Something went wrong. Please try again.');
    expect(error.code).toBe('unknown');
  });
});
