import { FirestoreTemplateBlockRepository } from '@/src/contexts/templateBlocks/infrastructure/firestoreTemplateBlock.repository';
import { RepositoryError } from '@/src/contexts/shared/domain/repository.errors';
import { userCollectionPath } from '@/src/lib/firebase/paths';
import { createMockTemplateBlock } from '@/test-utils/mockData';
import {
  collection,
  firestoreStore,
  resetFirestoreStore,
} from '@/test-utils/firestoreManualMock';

describe('FirestoreTemplateBlockRepository', () => {
  const userId = 'user-123';
  const db = {} as never;
  const collectionPath = userCollectionPath(userId, 'templateBlocks');

  beforeEach(() => {
    resetFirestoreStore();
  });

  it('requires userId', () => {
    expect(() => new FirestoreTemplateBlockRepository('', db)).toThrow(RepositoryError);
  });

  it('creates template block under users/{userId}/templateBlocks', async () => {
    const repository = new FirestoreTemplateBlockRepository(userId, db);
    const block = createMockTemplateBlock({ id: 'block-1' });

    await repository.create(block);

    expect(collection).toHaveBeenCalledWith(db, collectionPath);
    expect(firestoreStore.get(`${collectionPath}/block-1`)).toBeDefined();
  });

  it('updates template block', async () => {
    const repository = new FirestoreTemplateBlockRepository(userId, db);
    const block = createMockTemplateBlock({ id: 'block-1', name: 'Original' });

    await repository.create(block);
    await repository.update({ ...block, name: 'Updated', updatedAt: new Date() });

    expect(firestoreStore.get(`${collectionPath}/block-1`)?.name).toBe('Updated');
  });

  it('finds template block by id', async () => {
    const repository = new FirestoreTemplateBlockRepository(userId, db);
    const block = createMockTemplateBlock({ id: 'block-1' });

    await repository.create(block);

    await expect(repository.findById('block-1')).resolves.toMatchObject({
      id: 'block-1',
      name: block.name,
    });
  });

  it('lists active template blocks', async () => {
    const repository = new FirestoreTemplateBlockRepository(userId, db);

    await repository.create(createMockTemplateBlock({ id: 'active-1', status: 'active' }));
    await repository.create(createMockTemplateBlock({ id: 'archived-1', status: 'archived' }));

    const active = await repository.listActive();

    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe('active-1');
  });

  it('archives and restores template block', async () => {
    const repository = new FirestoreTemplateBlockRepository(userId, db);
    const block = createMockTemplateBlock({ id: 'block-1', status: 'active' });

    await repository.create(block);
    await repository.archive('block-1');

    expect(firestoreStore.get(`${collectionPath}/block-1`)?.status).toBe('archived');

    await repository.restore('block-1');

    expect(firestoreStore.get(`${collectionPath}/block-1`)?.status).toBe('active');
  });

  it('favorites and unfavorites template block', async () => {
    const repository = new FirestoreTemplateBlockRepository(userId, db);
    const block = createMockTemplateBlock({ id: 'block-1', favorite: false });

    await repository.create(block);
    await repository.setFavorite('block-1', true);

    expect(firestoreStore.get(`${collectionPath}/block-1`)?.favorite).toBe(true);

    await repository.setFavorite('block-1', false);

    expect(firestoreStore.get(`${collectionPath}/block-1`)?.favorite).toBe(false);
  });

  it('lists all template blocks across statuses', async () => {
    const repository = new FirestoreTemplateBlockRepository(userId, db);

    await repository.create(createMockTemplateBlock({ id: 'active-1', status: 'active' }));
    await repository.create(createMockTemplateBlock({ id: 'draft-1', status: 'draft' }));
    await repository.create(createMockTemplateBlock({ id: 'archived-1', status: 'archived' }));

    const blocks = await repository.listAll();

    expect(blocks).toHaveLength(3);
    expect(blocks.map((block) => block.id).sort()).toEqual(['active-1', 'archived-1', 'draft-1']);
  });

  it('isolates template blocks by user', async () => {
    const userARepository = new FirestoreTemplateBlockRepository('user-a', db);
    const userBRepository = new FirestoreTemplateBlockRepository('user-b', db);
    const userAPath = userCollectionPath('user-a', 'templateBlocks');
    const userBPath = userCollectionPath('user-b', 'templateBlocks');

    await userARepository.create(createMockTemplateBlock({ id: 'block-a' }));
    await userBRepository.create(createMockTemplateBlock({ id: 'block-b', name: 'User B Block' }));

    await expect(userARepository.findById('block-b')).resolves.toBeNull();
    await expect(userBRepository.findById('block-a')).resolves.toBeNull();
    expect(firestoreStore.get(`${userAPath}/block-a`)).toBeDefined();
    expect(firestoreStore.get(`${userBPath}/block-b`)).toBeDefined();
  });

  it('hard deletes template block', async () => {
    const repository = new FirestoreTemplateBlockRepository(userId, db);
    const block = createMockTemplateBlock({ id: 'block-1' });

    await repository.create(block);
    await repository.hardDelete('block-1');

    expect(firestoreStore.get(`${collectionPath}/block-1`)).toBeUndefined();
  });
});
