import type { User } from 'firebase/auth';

import { AuthError, type AuthUser } from '../domain/auth.model';

export function mapFirebaseUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email,
  };
}

export function mapFirebaseAuthError(error: unknown): AuthError {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: string }).code)
      : 'unknown';

  if (__DEV__) {
    console.error('[auth]', code, error);
  }

  switch (code) {
    case 'auth/invalid-email':
      return new AuthError('Enter a valid email address.', 'invalid_email');
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return new AuthError('Invalid email or password.', 'invalid_credentials');
    case 'auth/email-already-in-use':
      return new AuthError('An account with this email already exists.', 'email_in_use');
    case 'auth/weak-password':
      return new AuthError('Password must be at least 6 characters.', 'weak_password');
    case 'auth/network-request-failed':
      return new AuthError('Unable to connect. Check your network and try again.', 'network');
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return new AuthError(
        'Email/password sign-in is disabled in Firebase. Enable it under Authentication → Sign-in method.',
        'unknown'
      );
    case 'auth/unauthorized-domain':
      return new AuthError(
        'This app domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.',
        'unknown'
      );
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
    case 'auth/app-not-authorized':
      return new AuthError(
        'Firebase configuration looks invalid. Double-check your .env values and restart the dev server.',
        'missing_config'
      );
    case 'auth/too-many-requests':
      return new AuthError('Too many attempts. Wait a moment and try again.', 'unknown');
    default:
      return new AuthError('Something went wrong. Please try again.', 'unknown');
  }
}
