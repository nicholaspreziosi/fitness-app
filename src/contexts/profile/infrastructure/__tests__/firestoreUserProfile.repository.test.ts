import { FirestoreUserProfileRepository } from '@/src/contexts/profile/infrastructure/firestoreUserProfile.repository';
import { buildDefaultProfileFields } from '@/src/contexts/profile/domain/userProfile.rules';
import { RepositoryError } from '@/src/contexts/shared/domain/repository.errors';
import { userProfilePath } from '@/src/lib/firebase/paths';
import { collection, doc, firestoreStore, resetFirestoreStore } from '@/test-utils/firestoreManualMock';

describe('FirestoreUserProfileRepository', () => {
  const userId = 'user-123';
  const db = {} as never;
  const documentPath = userProfilePath(userId);

  beforeEach(() => {
    resetFirestoreStore();
  });

  it('requires userId', () => {
    expect(() => new FirestoreUserProfileRepository('', db)).toThrow(RepositoryError);
  });

  it('creates profile at users/{userId}', async () => {
    const repository = new FirestoreUserProfileRepository(userId, db);
    const profile = buildDefaultProfileFields(userId, { country: 'US' });

    await repository.create(profile);

    expect(collection).toHaveBeenCalledWith(db, 'users');
    expect(firestoreStore.get(`${documentPath}`)).toBeDefined();
  });

  it('finds profile by id', async () => {
    const repository = new FirestoreUserProfileRepository(userId, db);
    const profile = buildDefaultProfileFields(userId, { country: 'US' });

    await repository.create(profile);

    await expect(repository.findById(userId)).resolves.toMatchObject({
      id: userId,
      accountStatus: 'active',
    });
  });

  it('updates profile fields', async () => {
    const repository = new FirestoreUserProfileRepository(userId, db);
    const profile = buildDefaultProfileFields(userId, { country: 'US' });

    await repository.create(profile);
    await repository.update(userId, { firstName: 'Nick' });

    await expect(repository.findById(userId)).resolves.toMatchObject({
      firstName: 'Nick',
    });
  });
});
