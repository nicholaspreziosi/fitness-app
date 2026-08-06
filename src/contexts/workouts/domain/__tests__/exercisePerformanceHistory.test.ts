import { buildExercisePerformanceHistory } from '@/src/contexts/workouts/domain/exercisePerformanceHistory';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';

describe('buildExercisePerformanceHistory', () => {
  it('ignores non-completed workouts', () => {
    const workouts = [
      createMockWorkout({
        id: 'planned-1',
        status: 'planned',
        exercises: [
          createMockWorkoutExercise({
            exerciseId: 'exercise-1',
            actualWeight: 100,
            completed: true,
          }),
        ],
      }),
      createMockWorkout({
        id: 'in-progress-1',
        status: 'inProgress',
        exercises: [
          createMockWorkoutExercise({
            exerciseId: 'exercise-1',
            actualWeight: 110,
            completed: true,
          }),
        ],
      }),
      createMockWorkout({
        id: 'skipped-1',
        status: 'skipped',
        exercises: [
          createMockWorkoutExercise({
            exerciseId: 'exercise-1',
            actualWeight: 120,
            completed: true,
          }),
        ],
      }),
    ];

    expect(buildExercisePerformanceHistory(workouts, 'exercise-1')).toEqual([]);
  });

  it('ignores other exerciseIds', () => {
    const workouts = [
      createMockWorkout({
        id: 'workout-1',
        status: 'completed',
        exercises: [
          createMockWorkoutExercise({
            exerciseId: 'exercise-other',
            actualWeight: 100,
            actualReps: 8,
            actualSets: 2,
            completed: true,
          }),
        ],
      }),
    ];

    expect(buildExercisePerformanceHistory(workouts, 'exercise-1')).toEqual([]);
  });

  it('omits metrics when actuals are missing and does not fall back to planned', () => {
    const workouts = [
      createMockWorkout({
        id: 'workout-1',
        status: 'completed',
        date: createTestDate(0),
        exercises: [
          createMockWorkoutExercise({
            exerciseId: 'exercise-1',
            plannedWeight: 100,
            plannedReps: 8,
            plannedSets: 3,
            plannedHoldSeconds: 30,
            actualWeight: 90,
            completed: true,
          }),
        ],
      }),
    ];

    expect(buildExercisePerformanceHistory(workouts, 'exercise-1')).toEqual([
      {
        workoutId: 'workout-1',
        date: createTestDate(0),
        weight: 90,
      },
    ]);
  });

  it('uses max actual per metric when the same exercise appears multiple times', () => {
    const workouts = [
      createMockWorkout({
        id: 'workout-1',
        status: 'completed',
        date: createTestDate(0),
        exercises: [
          createMockWorkoutExercise({
            id: 'we-1',
            sortOrder: 0,
            exerciseId: 'exercise-1',
            actualWeight: 80,
            actualReps: 10,
            actualSets: 2,
            actualHoldSeconds: 20,
            completed: true,
          }),
          createMockWorkoutExercise({
            id: 'we-2',
            sortOrder: 1,
            exerciseId: 'exercise-1',
            actualWeight: 100,
            actualReps: 6,
            actualSets: 3,
            actualHoldSeconds: 45,
            completed: true,
          }),
        ],
      }),
    ];

    expect(buildExercisePerformanceHistory(workouts, 'exercise-1')).toEqual([
      {
        workoutId: 'workout-1',
        date: createTestDate(0),
        weight: 100,
        reps: 10,
        sets: 3,
        holdSeconds: 45,
      },
    ]);
  });

  it('sorts points by workout date ascending', () => {
    const workouts = [
      createMockWorkout({
        id: 'workout-later',
        status: 'completed',
        date: createTestDate(30),
        exercises: [
          createMockWorkoutExercise({
            exerciseId: 'exercise-1',
            actualWeight: 110,
            completed: true,
          }),
        ],
      }),
      createMockWorkout({
        id: 'workout-earlier',
        status: 'completed',
        date: createTestDate(0),
        exercises: [
          createMockWorkoutExercise({
            exerciseId: 'exercise-1',
            actualWeight: 90,
            completed: true,
          }),
        ],
      }),
    ];

    expect(buildExercisePerformanceHistory(workouts, 'exercise-1')).toEqual([
      {
        workoutId: 'workout-earlier',
        date: createTestDate(0),
        weight: 90,
      },
      {
        workoutId: 'workout-later',
        date: createTestDate(30),
        weight: 110,
      },
    ]);
  });

  it('skips completed workouts with no matching actual metrics', () => {
    const workouts = [
      createMockWorkout({
        id: 'workout-1',
        status: 'completed',
        exercises: [
          createMockWorkoutExercise({
            exerciseId: 'exercise-1',
            plannedWeight: 100,
            completed: true,
          }),
        ],
      }),
    ];

    expect(buildExercisePerformanceHistory(workouts, 'exercise-1')).toEqual([]);
  });
});
