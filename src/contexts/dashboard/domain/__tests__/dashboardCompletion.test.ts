import {
  calculateExerciseCompletionPercentage,
  calculateExerciseCompletionStats,
  calculateWorkoutCompletionStats,
} from '@/src/contexts/dashboard/domain/dashboardCompletion';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';

describe('calculateWorkoutCompletionStats', () => {
  it('calculates completed workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'completed-1', status: 'completed' }),
      createMockWorkout({ id: 'planned-1', status: 'planned' }),
    ];

    expect(calculateWorkoutCompletionStats(workouts)).toEqual({
      completed: 1,
      total: 2,
    });
  });

  it('calculates total workouts from planned, inProgress, and completed', () => {
    const workouts = [
      createMockWorkout({ id: 'planned', status: 'planned' }),
      createMockWorkout({ id: 'in-progress', status: 'inProgress' }),
      createMockWorkout({ id: 'completed', status: 'completed' }),
    ];

    expect(calculateWorkoutCompletionStats(workouts).total).toBe(3);
  });

  it('ignores archived workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'archived', status: 'archived' }),
      createMockWorkout({ id: 'planned', status: 'planned' }),
    ];

    expect(calculateWorkoutCompletionStats(workouts)).toEqual({
      completed: 0,
      total: 1,
    });
  });

  it('excludes draft and skipped workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'draft', status: 'draft' }),
      createMockWorkout({ id: 'skipped', status: 'skipped' }),
      createMockWorkout({ id: 'planned', status: 'planned' }),
    ];

    expect(calculateWorkoutCompletionStats(workouts)).toEqual({
      completed: 0,
      total: 1,
    });
  });

  it('handles empty workout list', () => {
    expect(calculateWorkoutCompletionStats([])).toEqual({
      completed: 0,
      total: 0,
    });
  });
});

describe('calculateExerciseCompletionStats', () => {
  it('calculates completed exercises', () => {
    const workouts = [
      createMockWorkout({
        status: 'planned',
        exercises: [
          createMockWorkoutExercise({ completed: true }),
          createMockWorkoutExercise({ id: 'we-2', completed: false }),
        ],
      }),
    ];

    expect(calculateExerciseCompletionStats(workouts)).toEqual({
      completed: 1,
      total: 2,
    });
  });

  it('calculates total exercises', () => {
    const workouts = [
      createMockWorkout({
        status: 'planned',
        exercises: [
          createMockWorkoutExercise({ completed: false }),
          createMockWorkoutExercise({ id: 'we-2', completed: false }),
        ],
      }),
      createMockWorkout({
        id: 'workout-2',
        status: 'completed',
        exercises: [createMockWorkoutExercise({ id: 'we-3', completed: true })],
      }),
    ];

    expect(calculateExerciseCompletionStats(workouts)).toEqual({
      completed: 1,
      total: 3,
    });
  });

  it('ignores archived workouts', () => {
    const workouts = [
      createMockWorkout({
        status: 'archived',
        exercises: [createMockWorkoutExercise({ completed: true })],
      }),
      createMockWorkout({
        id: 'workout-2',
        status: 'planned',
        exercises: [createMockWorkoutExercise({ id: 'we-2', completed: false })],
      }),
    ];

    expect(calculateExerciseCompletionStats(workouts)).toEqual({
      completed: 0,
      total: 1,
    });
  });

  it('handles empty workout list', () => {
    expect(calculateExerciseCompletionStats([])).toEqual({
      completed: 0,
      total: 0,
    });
  });
});

describe('calculateExerciseCompletionPercentage', () => {
  it('calculates exercise completion percentage', () => {
    const workouts = [
      createMockWorkout({
        status: 'planned',
        exercises: Array.from({ length: 4 }, (_, index) =>
          createMockWorkoutExercise({
            id: `we-${index}`,
            completed: index < 3,
          })
        ),
      }),
    ];

    expect(calculateExerciseCompletionPercentage(workouts)).toBe(75);
  });

  it('returns 0 when no exercises exist', () => {
    expect(calculateExerciseCompletionPercentage([])).toBe(0);
  });

  it('handles partially completed workouts', () => {
    const workouts = [
      createMockWorkout({
        status: 'inProgress',
        exercises: [
          createMockWorkoutExercise({ completed: true }),
          createMockWorkoutExercise({ id: 'we-2', completed: false }),
        ],
      }),
      createMockWorkout({
        id: 'workout-2',
        status: 'completed',
        exercises: [
          createMockWorkoutExercise({ id: 'we-3', completed: true }),
          createMockWorkoutExercise({ id: 'we-4', completed: true }),
        ],
      }),
    ];

    expect(calculateExerciseCompletionPercentage(workouts)).toBe(75);
  });
});
