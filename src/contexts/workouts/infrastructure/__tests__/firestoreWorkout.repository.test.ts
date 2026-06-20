import { FirestoreWorkoutRepository } from '@/src/contexts/workouts/infrastructure/firestoreWorkout.repository';
import { RepositoryError } from '@/src/contexts/shared/domain/repository.errors';
import { userCollectionPath } from '@/src/lib/firebase/paths';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import {
  collection,
  firestoreStore,
  resetFirestoreStore,
} from '@/test-utils/firestoreManualMock';
import { Timestamp } from 'firebase/firestore';

describe('FirestoreWorkoutRepository', () => {
  const userId = 'user-123';
  const db = {} as never;
  const collectionPath = userCollectionPath(userId, 'workouts');

  beforeEach(() => {
    resetFirestoreStore();
  });

  it('requires userId', () => {
    expect(() => new FirestoreWorkoutRepository('', db)).toThrow(RepositoryError);
  });

  it('creates workout under users/{userId}/workouts', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);
    const workout = createMockWorkout({ id: 'workout-1' });

    await repository.create(workout);

    expect(collection).toHaveBeenCalledWith(db, collectionPath);
    expect(firestoreStore.get(`${collectionPath}/workout-1`)).toBeDefined();
  });

  it('updates workout', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);
    const workout = createMockWorkout({ id: 'workout-1', name: 'Original' });

    await repository.create(workout);
    await repository.update({ ...workout, name: 'Updated', updatedAt: new Date() });

    expect(firestoreStore.get(`${collectionPath}/workout-1`)?.name).toBe('Updated');
  });

  it('preserves embedded WorkoutExercise[]', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);
    const workout = createMockWorkout({
      id: 'workout-1',
      exercises: [
        createMockWorkoutExercise({
          exerciseId: 'exercise-1',
          bodyPart: 'Upper Legs',
          primaryMuscles: ['Quads'],
          completed: false,
        }),
      ],
    });

    await repository.create(workout);
    const stored = await repository.findById('workout-1');

    expect(stored?.exercises).toHaveLength(1);
    expect(stored?.exercises[0]).toMatchObject({
      id: 'workout-exercise-1',
      sortOrder: 0,
      exerciseId: 'exercise-1',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      completed: false,
    });
  });

  it('does not create a separate workoutExercises collection', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);
    const workout = createMockWorkout({ id: 'workout-1' });

    await repository.create(workout);

    const storedPaths = [...firestoreStore.keys()];
    expect(storedPaths.every((path) => !path.includes('/workoutExercises/'))).toBe(true);
    expect(storedPaths.some((path) => path.startsWith(`${collectionPath}/`))).toBe(true);
  });

  it('lists workouts by week and excludes archived workouts', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);
    const weekStart = createTestDate(0);
    const weekEnd = createTestDate(6);

    await repository.create(
      createMockWorkout({
        id: 'planned-1',
        status: 'planned',
        date: createTestDate(2),
      })
    );
    await repository.create(
      createMockWorkout({
        id: 'archived-1',
        status: 'archived',
        date: createTestDate(3),
      })
    );

    const workouts = await repository.listByWeek(weekStart, weekEnd);

    expect(workouts.map((workout) => workout.id)).toEqual(['planned-1']);
  });

  it('lists workouts by date range and excludes archived workouts', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);
    const rangeStart = createTestDate(0);
    const rangeEnd = createTestDate(30);

    await repository.create(
      createMockWorkout({
        id: 'planned-1',
        status: 'planned',
        date: createTestDate(10),
      })
    );
    await repository.create(
      createMockWorkout({
        id: 'archived-1',
        status: 'archived',
        date: createTestDate(15),
      })
    );
    await repository.create(
      createMockWorkout({
        id: 'outside-range',
        status: 'planned',
        date: createTestDate(45),
      })
    );

    const workouts = await repository.listByDateRange(rangeStart, rangeEnd);

    expect(workouts.map((workout) => workout.id)).toEqual(['planned-1']);
  });

  it('lists draft workouts', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);

    await repository.create(createMockWorkout({ id: 'draft-1', status: 'draft', date: createTestDate() }));
    await repository.create(
      createMockWorkout({ id: 'planned-1', status: 'planned', date: createTestDate() })
    );

    const drafts = await repository.listDrafts();

    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.id).toBe('draft-1');
  });

  it('archives workout', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);
    const workout = createMockWorkout({ id: 'workout-1', status: 'completed' });

    await repository.create(workout);
    await repository.archive('workout-1');

    expect(firestoreStore.get(`${collectionPath}/workout-1`)?.status).toBe('archived');
  });

  it('hard deletes draft and planned workouts', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);

    await repository.create(createMockWorkout({ id: 'draft-1', status: 'draft', date: createTestDate() }));
    await repository.create(
      createMockWorkout({ id: 'planned-1', status: 'planned', date: createTestDate() })
    );

    await repository.hardDelete('draft-1');
    await repository.hardDelete('planned-1');

    expect(firestoreStore.has(`${collectionPath}/draft-1`)).toBe(false);
    expect(firestoreStore.has(`${collectionPath}/planned-1`)).toBe(false);
  });

  it('stores workout dates as timestamps for weekly queries', async () => {
    const repository = new FirestoreWorkoutRepository(userId, db);
    const date = createTestDate(2);

    await repository.create(createMockWorkout({ id: 'workout-1', date }));

    expect(firestoreStore.get(`${collectionPath}/workout-1`)?.date).toEqual(
      Timestamp.fromDate(date)
    );
  });
});
