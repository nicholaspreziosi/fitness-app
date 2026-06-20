import { createPlannerDropHandler } from '@/src/ui/workouts/hooks/usePlannerDropHandler';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';

describe('usePlannerDropHandler', () => {
  it('blocks cross-workout drop when exercise already exists in target', async () => {
    const onBlocked = jest.fn();
    const mutateAsync = jest.fn();
    const source = createMockWorkout({
      id: 'source',
      status: 'planned',
      exercises: [createMockWorkoutExercise({ id: 'we-1', exerciseId: 'exercise-1' })],
    });
    const target = createMockWorkout({
      id: 'target',
      status: 'planned',
      exercises: [createMockWorkoutExercise({ id: 'we-2', exerciseId: 'exercise-2' })],
    });

    const handler = createPlannerDropHandler({
      workouts: [source, target],
      mutations: {
        moveExercise: { mutateAsync },
      } as never,
      onBlocked,
    });

    await handler.handleCrossWorkoutDrop(
      {
        sourceWorkoutId: 'source',
        workoutExerciseId: 'we-1',
        exerciseId: 'exercise-2',
      },
      'target'
    );

    expect(onBlocked).toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('ignores drop on the same workout', async () => {
    const mutateAsync = jest.fn();
    const workout = createMockWorkout({
      id: 'workout-1',
      status: 'planned',
      exercises: [createMockWorkoutExercise({ id: 'we-1', exerciseId: 'exercise-1' })],
    });

    const handler = createPlannerDropHandler({
      workouts: [workout],
      mutations: {
        moveExercise: { mutateAsync },
      } as never,
      onBlocked: jest.fn(),
    });

    await handler.handleCrossWorkoutDrop(
      {
        sourceWorkoutId: 'workout-1',
        workoutExerciseId: 'we-1',
        exerciseId: 'exercise-1',
      },
      'workout-1'
    );

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('moves exercise between editable workouts', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    const source = createMockWorkout({
      id: 'source',
      status: 'planned',
      exercises: [createMockWorkoutExercise({ id: 'we-1', exerciseId: 'exercise-1' })],
    });
    const target = createMockWorkout({
      id: 'target',
      status: 'planned',
      exercises: [],
    });

    const handler = createPlannerDropHandler({
      workouts: [source, target],
      mutations: {
        moveExercise: { mutateAsync },
      } as never,
      onBlocked: jest.fn(),
    });

    await handler.handleCrossWorkoutDrop(
      {
        sourceWorkoutId: 'source',
        workoutExerciseId: 'we-1',
        exerciseId: 'exercise-1',
      },
      'target'
    );

    expect(mutateAsync).toHaveBeenCalledWith({
      sourceWorkoutId: 'source',
      workoutExerciseId: 'we-1',
      targetWorkoutId: 'target',
    });
  });
});
