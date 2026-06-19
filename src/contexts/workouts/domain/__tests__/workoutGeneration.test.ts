import { generateWorkoutExercisesFromExercises } from '@/src/contexts/workouts/domain/workoutGeneration';
import { createMockExercise } from '@/test-utils/mockData';

describe('generateWorkoutExercisesFromExercises', () => {
  it('generates WorkoutExercise[] from selected exercises', () => {
    const exercises = [
      createMockExercise({ id: 'exercise-1' }),
      createMockExercise({ id: 'exercise-2', name: 'Leg Press' }),
    ];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result).toHaveLength(2);
  });

  it('preserves exerciseId', () => {
    const exercises = [createMockExercise({ id: 'pendulum-squat' })];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result[0]?.exerciseId).toBe('pendulum-squat');
  });

  it('copies planned values from Exercise defaults', () => {
    const exercises = [
      createMockExercise({
        defaultSets: 3,
        defaultReps: 10,
        defaultHoldSeconds: 30,
        defaultWeight: 80,
      }),
    ];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result[0]).toMatchObject({
      plannedSets: 3,
      plannedReps: 10,
      plannedHoldSeconds: 30,
      plannedWeight: 80,
    });
  });

  it('copies bodyPart and muscles into WorkoutExercise', () => {
    const exercises = [
      createMockExercise({
        bodyPart: 'Upper Legs',
        primaryMuscles: ['Quads'],
        secondaryMuscles: ['Glute Max'],
      }),
    ];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result[0]).toMatchObject({
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glute Max'],
    });
  });

  it('sets completed to false by default', () => {
    const result = generateWorkoutExercisesFromExercises([createMockExercise()]);

    expect(result[0]?.completed).toBe(false);
  });

  it('generates unique id for each WorkoutExercise', () => {
    const exercises = [
      createMockExercise({ id: 'exercise-1' }),
      createMockExercise({ id: 'exercise-2' }),
    ];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result[0]?.id).toBeTruthy();
    expect(result[1]?.id).toBeTruthy();
    expect(result[0]?.id).not.toBe(result[1]?.id);
  });

  it('assigns sequential sortOrder when generating exercises', () => {
    const exercises = [
      createMockExercise({ id: 'exercise-1' }),
      createMockExercise({ id: 'exercise-2' }),
      createMockExercise({ id: 'exercise-3' }),
    ];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result.map((exercise) => exercise.sortOrder)).toEqual([0, 1, 2]);
  });

  it('allows multiple WorkoutExercises with the same exerciseId', () => {
    const exercises = [
      createMockExercise({ id: 'exercise-1' }),
      createMockExercise({ id: 'exercise-1' }),
    ];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result).toHaveLength(2);
    expect(result[0]?.exerciseId).toBe('exercise-1');
    expect(result[1]?.exerciseId).toBe('exercise-1');
    expect(result[0]?.id).not.toBe(result[1]?.id);
  });

  it('handles missing defaults safely', () => {
    const exercises = [
      createMockExercise({
        defaultSets: undefined,
        defaultReps: undefined,
        defaultHoldSeconds: undefined,
        defaultWeight: undefined,
      }),
    ];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result[0]).toMatchObject({
      exerciseId: 'exercise-1',
      completed: false,
    });
    expect(result[0]?.plannedSets).toBeUndefined();
  });

  it('handles exercises with no bodyPart or muscles safely', () => {
    const exercises = [
      createMockExercise({
        bodyPart: undefined,
        primaryMuscles: undefined,
        secondaryMuscles: undefined,
      }),
    ];

    const result = generateWorkoutExercisesFromExercises(exercises);

    expect(result[0]?.bodyPart).toBeUndefined();
    expect(result[0]?.primaryMuscles).toBeUndefined();
    expect(result[0]?.secondaryMuscles).toBeUndefined();
  });

  it('skips archived exercises unless explicitly included', () => {
    const exercises = [
      createMockExercise({ id: 'active-exercise', status: 'active' }),
      createMockExercise({ id: 'archived-exercise', status: 'archived' }),
    ];

    const defaultResult = generateWorkoutExercisesFromExercises(exercises);
    const includedResult = generateWorkoutExercisesFromExercises(exercises, {
      includeArchived: true,
    });

    expect(defaultResult).toHaveLength(1);
    expect(defaultResult[0]?.exerciseId).toBe('active-exercise');
    expect(includedResult).toHaveLength(2);
  });
});
