import { FirestoreExerciseRepository } from '@/src/contexts/exercises/infrastructure/firestoreExercise.repository';
import { RepositoryError } from '@/src/contexts/shared/domain/repository.errors';
import { userCollectionPath } from '@/src/lib/firebase/paths';
import { createMockExercise } from '@/test-utils/mockData';
import {
  collection,
  firestoreStore,
  resetFirestoreStore,
} from '@/test-utils/firestoreManualMock';

describe('FirestoreExerciseRepository', () => {
  const userId = 'user-123';
  const db = {} as never;
  const collectionPath = userCollectionPath(userId, 'exercises');

  beforeEach(() => {
    resetFirestoreStore();
  });

  it('requires userId', () => {
    expect(() => new FirestoreExerciseRepository('', db)).toThrow(RepositoryError);
    expect(() => new FirestoreExerciseRepository('', db)).toThrow('User ID is required.');
  });

  it('creates exercise under users/{userId}/exercises', async () => {
    const repository = new FirestoreExerciseRepository(userId, db);
    const exercise = createMockExercise({ id: 'exercise-1' });

    await repository.create(exercise);

    expect(collection).toHaveBeenCalledWith(db, collectionPath);
    expect(firestoreStore.get(`${collectionPath}/exercise-1`)).toBeDefined();
  });

  it('updates exercise', async () => {
    const repository = new FirestoreExerciseRepository(userId, db);
    const exercise = createMockExercise({ id: 'exercise-1', name: 'Original' });

    await repository.create(exercise);
    await repository.update({ ...exercise, name: 'Updated', updatedAt: new Date() });

    expect(firestoreStore.get(`${collectionPath}/exercise-1`)?.name).toBe('Updated');
  });

  it('finds exercise by id', async () => {
    const repository = new FirestoreExerciseRepository(userId, db);
    const exercise = createMockExercise({ id: 'exercise-1' });

    await repository.create(exercise);

    await expect(repository.findById('exercise-1')).resolves.toMatchObject({
      id: 'exercise-1',
      name: exercise.name,
    });
  });

  it('lists active exercises', async () => {
    const repository = new FirestoreExerciseRepository(userId, db);

    await repository.create(createMockExercise({ id: 'active-1', status: 'active' }));
    await repository.create(createMockExercise({ id: 'archived-1', status: 'archived' }));

    const active = await repository.listActive();

    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe('active-1');
  });

  it('lists archived exercises', async () => {
    const repository = new FirestoreExerciseRepository(userId, db);

    await repository.create(createMockExercise({ id: 'active-1', status: 'active' }));
    await repository.create(createMockExercise({ id: 'archived-1', status: 'archived' }));

    const archived = await repository.listArchived();

    expect(archived).toHaveLength(1);
    expect(archived[0]?.id).toBe('archived-1');
  });

  it('archives and restores exercise', async () => {
    const repository = new FirestoreExerciseRepository(userId, db);
    const exercise = createMockExercise({ id: 'exercise-1', status: 'active' });

    await repository.create(exercise);
    await repository.archive('exercise-1');

    expect(firestoreStore.get(`${collectionPath}/exercise-1`)?.status).toBe('archived');

    await repository.restore('exercise-1');

    expect(firestoreStore.get(`${collectionPath}/exercise-1`)?.status).toBe('active');
  });

  it('favorites and unfavorites exercise', async () => {
    const repository = new FirestoreExerciseRepository(userId, db);
    const exercise = createMockExercise({ id: 'exercise-1', favorite: false });

    await repository.create(exercise);
    await repository.setFavorite('exercise-1', true);

    expect(firestoreStore.get(`${collectionPath}/exercise-1`)?.favorite).toBe(true);

    await repository.setFavorite('exercise-1', false);

    expect(firestoreStore.get(`${collectionPath}/exercise-1`)?.favorite).toBe(false);
  });

  it('reads exercises for the current user', async () => {
    const repository = new FirestoreExerciseRepository(userId, db);

    await repository.create(createMockExercise({ id: 'exercise-1', name: 'Pendulum Squat' }));
    await repository.create(createMockExercise({ id: 'exercise-2', name: 'Leg Press' }));

    const exercises = await repository.listAll();

    expect(exercises).toHaveLength(2);
    expect(exercises.map((exercise) => exercise.name)).toEqual(
      expect.arrayContaining(['Pendulum Squat', 'Leg Press'])
    );
  });

  it('keeps user-scoped data isolated', async () => {
    const userARepository = new FirestoreExerciseRepository('user-a', db);
    const userBRepository = new FirestoreExerciseRepository('user-b', db);

    await userARepository.create(createMockExercise({ id: 'exercise-1', name: 'User A Exercise' }));

    await expect(userBRepository.findById('exercise-1')).resolves.toBeNull();
    await expect(userBRepository.listAll()).resolves.toEqual([]);
  });
});
