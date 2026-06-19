jest.mock('@/src/lib/firebase/app', () => ({
  getFirebaseAuth: jest.fn(),
}));

import { AuthError } from '@/src/contexts/auth/domain/auth.model';
import { FirebaseAuthRepository } from '@/src/contexts/auth/infrastructure/firebaseAuth.repository';
import { getFirebaseAuth } from '@/src/lib/firebase/app';
import {
  createMockFirebaseUser,
  createMockUserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  resetFirebaseAuthMock,
  setMockAuthUser,
  signInWithEmailAndPassword,
  signOut,
} from '@/test-utils/firebaseAuthManualMock';

const getFirebaseAuthMock = getFirebaseAuth as jest.MockedFunction<typeof getFirebaseAuth>;

describe('FirebaseAuthRepository', () => {
  const repository = new FirebaseAuthRepository();
  const auth = { appName: 'test' };

  beforeEach(() => {
    resetFirebaseAuthMock();
    getFirebaseAuthMock.mockReturnValue(auth as never);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null auth state when Firebase auth is not configured', () => {
    getFirebaseAuthMock.mockReturnValue(null);

    const callback = jest.fn();
    const unsubscribe = repository.onAuthStateChanged(callback);

    expect(callback).toHaveBeenCalledWith(null);
    expect(unsubscribe()).toBeUndefined();
    expect(onAuthStateChanged).not.toHaveBeenCalled();
  });

  it('subscribes to auth state changes and maps the Firebase user', () => {
    const callback = jest.fn();
    const firebaseUser = createMockFirebaseUser();

    repository.onAuthStateChanged(callback);
    setMockAuthUser(firebaseUser);

    expect(onAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function));
    expect(callback).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'you@example.com',
    });
  });

  it('signs in with trimmed email and password', async () => {
    const firebaseUser = createMockFirebaseUser();
    signInWithEmailAndPassword.mockResolvedValue(createMockUserCredential(firebaseUser) as never);

    await expect(repository.signInWithEmail('  you@example.com  ', 'secret')).resolves.toEqual({
      id: 'user-123',
      email: 'you@example.com',
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'you@example.com', 'secret');
  });

  it('signs up with trimmed email and password', async () => {
    const firebaseUser = createMockFirebaseUser({ uid: 'new-user' });
    createUserWithEmailAndPassword.mockResolvedValue(createMockUserCredential(firebaseUser) as never);

    await expect(repository.signUpWithEmail('you@example.com', 'secret')).resolves.toEqual({
      id: 'new-user',
      email: 'you@example.com',
    });

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'you@example.com', 'secret');
  });

  it('signs out', async () => {
    signOut.mockResolvedValue(undefined);

    await repository.signOut();

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('throws when Firebase auth is not configured for mutations', async () => {
    getFirebaseAuthMock.mockReturnValue(null);

    await expect(repository.signInWithEmail('you@example.com', 'secret')).rejects.toMatchObject({
      message: 'Firebase is not configured.',
      code: 'missing_config',
    });
    await expect(repository.signUpWithEmail('you@example.com', 'secret')).rejects.toMatchObject({
      message: 'Firebase is not configured.',
      code: 'missing_config',
    });
    await expect(repository.signOut()).rejects.toMatchObject({
      message: 'Firebase is not configured.',
      code: 'missing_config',
    });
  });

  it('maps Firebase sign-in errors to AuthError', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' });

    await expect(repository.signInWithEmail('you@example.com', 'wrong')).rejects.toBeInstanceOf(
      AuthError
    );
  });

  it('maps Firebase sign-up errors to AuthError', async () => {
    createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' });

    await expect(repository.signUpWithEmail('you@example.com', 'secret')).rejects.toMatchObject({
      message: 'An account with this email already exists.',
      code: 'email_in_use',
    });
  });
});
