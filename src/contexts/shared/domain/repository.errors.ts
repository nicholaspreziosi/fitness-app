export type RepositoryErrorCode =
  | 'missing_user_id'
  | 'missing_config'
  | 'not_found'
  | 'permission_denied'
  | 'network'
  | 'invalid_operation'
  | 'unknown';

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code: RepositoryErrorCode
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export function requireUserId(userId: string): void {
  if (!userId.trim()) {
    throw new RepositoryError('User ID is required.', 'missing_user_id');
  }
}
