import {
  workoutExerciseSchema,
  workoutSchema,
} from '@/src/contexts/workouts/domain/workout.schema';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';

describe('workoutExerciseSchema', () => {
  it('requires exerciseId', () => {
    const missingId = workoutExerciseSchema.safeParse({ completed: false });
    const withId = workoutExerciseSchema.safeParse(createMockWorkoutExercise());

    expect(missingId.success).toBe(false);
    expect(withId.success).toBe(true);
  });

  it('validates id', () => {
    const result = workoutExerciseSchema.safeParse(createMockWorkoutExercise({ id: 'we-1' }));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('we-1');
    }
  });

  it('rejects missing id', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      id: undefined,
    });

    expect(result.success).toBe(false);
  });

  it('validates sortOrder', () => {
    const result = workoutExerciseSchema.safeParse(createMockWorkoutExercise({ sortOrder: 2 }));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortOrder).toBe(2);
    }
  });

  it('rejects invalid sortOrder', () => {
    const negative = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      sortOrder: -1,
    });
    const nonInteger = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      sortOrder: 1.5,
    });

    expect(negative.success).toBe(false);
    expect(nonInteger.success).toBe(false);
  });

  it('supports copied bodyPart', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      bodyPart: 'Upper Legs',
    });

    expect(result.success).toBe(true);
  });

  it('supports copied primaryMuscles and secondaryMuscles', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glute Max'],
    });

    expect(result.success).toBe(true);
  });

  it('supports plannedSets, plannedReps, plannedHoldSeconds, plannedWeight', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      plannedSets: 3,
      plannedReps: 10,
      plannedHoldSeconds: 45,
      plannedWeight: 100,
    });

    expect(result.success).toBe(true);
  });

  it('supports actualSets, actualReps, actualHoldSeconds, actualWeight', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      actualSets: 3,
      actualReps: 10,
      actualHoldSeconds: 45,
      actualWeight: 105,
    });

    expect(result.success).toBe(true);
  });

  it('supports notes', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      notes: 'Felt strong today',
    });

    expect(result.success).toBe(true);
  });

  it('supports completed boolean', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      completed: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid bodyPart values', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      bodyPart: 'Invalid',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid muscle values', () => {
    const result = workoutExerciseSchema.safeParse({
      ...createMockWorkoutExercise(),
      primaryMuscles: ['Invalid Muscle'],
    });

    expect(result.success).toBe(false);
  });
});

describe('workoutSchema', () => {
  const baseWorkout = createMockWorkout();

  it.each(['draft', 'planned', 'completed', 'skipped', 'archived'] as const)(
    'validates status: %s',
    (status) => {
      const result = workoutSchema.safeParse({
        ...baseWorkout,
        status,
        date: status === 'draft' ? undefined : createTestDate(),
      });

      expect(result.success).toBe(true);
    }
  );

  it('allows optional date for draft workouts', () => {
    const result = workoutSchema.safeParse({
      ...baseWorkout,
      status: 'draft',
      date: undefined,
    });

    expect(result.success).toBe(true);
  });

  it.each(['planned', 'completed', 'skipped', 'archived'] as const)(
    'requires date for %s workouts',
    (status) => {
      const result = workoutSchema.safeParse({
        ...baseWorkout,
        status,
        date: undefined,
      });

      expect(result.success).toBe(false);
    }
  );

  it('stores embedded WorkoutExercise[]', () => {
    const exercises = [
      createMockWorkoutExercise({ id: 'workout-exercise-1', exerciseId: 'exercise-1', sortOrder: 0 }),
      createMockWorkoutExercise({ id: 'workout-exercise-2', exerciseId: 'exercise-2', sortOrder: 1 }),
    ];

    const result = workoutSchema.safeParse({
      ...baseWorkout,
      exercises,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exercises).toHaveLength(2);
      expect(result.data.exercises[0]?.exerciseId).toBe('exercise-1');
    }
  });

  it('does not require or reference a separate WorkoutExercise collection', () => {
    const result = workoutSchema.safeParse(baseWorkout);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.exercises)).toBe(true);
      expect(result.data).not.toHaveProperty('workoutExerciseIds');
    }
  });

  it('rejects invalid workout statuses', () => {
    const result = workoutSchema.safeParse({
      ...baseWorkout,
      status: 'cancelled',
    });

    expect(result.success).toBe(false);
  });
});
