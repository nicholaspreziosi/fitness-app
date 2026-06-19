jest.mock('@/src/lib/firebase/app', () => ({
  getFirebaseAuth: jest.fn(),
  getFirebaseApp: jest.fn(),
  getFirestoreDb: jest.fn(),
}));

import { AuthService } from '@/src/contexts/auth/application/auth.service';
import type { AuthRepository } from '@/src/contexts/auth/domain/auth.repository';

function createAuthRepositoryMock(
  overrides: Partial<AuthRepository> = {}
): AuthRepository {
  return {
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    signOut: jest.fn(),
    ...overrides,
  };
}

describe('AuthService', () => {
  it('delegates auth state subscription to the repository', () => {
    const unsubscribe = jest.fn();
    const repository = createAuthRepositoryMock({
      onAuthStateChanged: jest.fn(() => unsubscribe),
    });
    const service = new AuthService(repository);
    const callback = jest.fn();

    expect(service.onAuthStateChanged(callback)).toBe(unsubscribe);
    expect(repository.onAuthStateChanged).toHaveBeenCalledWith(callback);
  });

  it('signs in through the repository', async () => {
    const user = { id: 'user-123', email: 'you@example.com' };
    const repository = createAuthRepositoryMock({
      signInWithEmail: jest.fn().mockResolvedValue(user),
    });
    const service = new AuthService(repository);

    await expect(service.signIn('you@example.com', 'secret')).resolves.toEqual(user);
    expect(repository.signInWithEmail).toHaveBeenCalledWith('you@example.com', 'secret');
  });

  it('signs up through the repository', async () => {
    const user = { id: 'user-123', email: 'you@example.com' };
    const repository = createAuthRepositoryMock({
      signUpWithEmail: jest.fn().mockResolvedValue(user),
    });
    const service = new AuthService(repository);

    await expect(service.signUp('you@example.com', 'secret')).resolves.toEqual(user);
    expect(repository.signUpWithEmail).toHaveBeenCalledWith('you@example.com', 'secret');
  });

  it('signs out through the repository', async () => {
    const repository = createAuthRepositoryMock({
      signOut: jest.fn().mockResolvedValue(undefined),
    });
    const service = new AuthService(repository);

    await service.signOut();

    expect(repository.signOut).toHaveBeenCalled();
  });
});
