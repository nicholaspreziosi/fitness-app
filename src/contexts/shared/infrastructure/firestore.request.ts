import { RepositoryError } from '@/src/contexts/shared/domain/repository.errors';

const FIRESTORE_API_DISABLED_PATTERNS = [
  'Cloud Firestore API has not been used',
  'Firestore API has not been used',
  'firestore.googleapis.com/overview',
];

const FIRESTORE_RULES_PATTERNS = ['Missing or insufficient permissions', 'permission-denied'];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return '';
}

function getErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }

  return '';
}

export function mapFirestoreError(error: unknown, fallbackMessage: string): RepositoryError {
  if (error instanceof RepositoryError) {
    return error;
  }

  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const normalized = `${code} ${message}`.toLowerCase();

  if (FIRESTORE_API_DISABLED_PATTERNS.some((pattern) => message.includes(pattern))) {
    return new RepositoryError(
      'Firestore is not enabled for this Firebase project. Open Firebase Console → Build → Firestore Database, create a database, then reload the app.',
      'missing_config'
    );
  }

  if (
    code === 'permission-denied' ||
    FIRESTORE_RULES_PATTERNS.some((pattern) => normalized.includes(pattern.toLowerCase()))
  ) {
    return new RepositoryError(
      'Firestore denied access. Create your Firestore database and deploy rules that allow authenticated access under users/{userId}/.',
      'permission_denied'
    );
  }

  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return new RepositoryError('Unable to reach Firestore. Check your connection.', 'network');
  }

  if (message.length > 0) {
    return new RepositoryError(message, 'unknown');
  }

  return new RepositoryError(fallbackMessage, 'unknown');
}

export async function runFirestoreRequest<T>(
  label: string,
  operation: () => Promise<T>,
  timeoutMs = 10000
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation(),
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(
            new RepositoryError(
              `Timed out while ${label}. Firestore may not be enabled yet, or your network is blocking Firebase.`,
              'network'
            )
          );
        }, timeoutMs);
      }),
    ]);
  } catch (error) {
    throw mapFirestoreError(error, `Unable to complete Firestore request while ${label}.`);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
