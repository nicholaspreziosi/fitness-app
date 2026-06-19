export interface AuthUser {
  id: string;
  email: string | null;
}

export type AuthErrorCode =
  | 'missing_config'
  | 'invalid_email'
  | 'invalid_credentials'
  | 'email_in_use'
  | 'weak_password'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: AuthErrorCode
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
