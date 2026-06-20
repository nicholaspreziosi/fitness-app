import {
  calculateWorkoutProgress,
  filterActiveWorkoutsForDate,
  findActiveSessionWorkout,
} from '@/src/contexts/workouts/domain/workoutSession.rules';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';

describe('filterActiveWorkoutsForDate', () => {
  const today = createTestDate();
  const tomorrow = createTestDate(1);

  it('returns planned and inProgress workouts for the given date', () => {
    const workouts = [
      createMockWorkout({ id: 'planned', status: 'planned', date: today }),
      createMockWorkout({ id: 'in-progress', status: 'inProgress', date: today }),
      createMockWorkout({ id: 'other-day', status: 'planned', date: tomorrow }),
    ];

    const result = filterActiveWorkoutsForDate(workouts, today);

    expect(result.map((workout) => workout.id)).toEqual(['planned', 'in-progress']);
  });

  it('excludes draft, completed, skipped, and archived workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'draft', status: 'draft', date: today }),
      createMockWorkout({ id: 'completed', status: 'completed', date: today }),
      createMockWorkout({ id: 'skipped', status: 'skipped', date: today }),
      createMockWorkout({ id: 'archived', status: 'archived', date: today }),
      createMockWorkout({ id: 'planned', status: 'planned', date: today }),
    ];

    const result = filterActiveWorkoutsForDate(workouts, today);

    expect(result.map((workout) => workout.id)).toEqual(['planned']);
  });
});

describe('findActiveSessionWorkout', () => {
  it('returns the first inProgress workout with activeSession true', () => {
    const workouts = [
      createMockWorkout({
        id: 'planned',
        status: 'planned',
        activeSession: true,
      }),
      createMockWorkout({
        id: 'active',
        status: 'inProgress',
        activeSession: true,
      }),
      createMockWorkout({
        id: 'also-active',
        status: 'inProgress',
        activeSession: true,
      }),
    ];

    expect(findActiveSessionWorkout(workouts)?.id).toBe('active');
  });

  it('returns null when no inProgress workout has activeSession true', () => {
    const workouts = [
      createMockWorkout({
        id: 'paused',
        status: 'inProgress',
        activeSession: false,
      }),
      createMockWorkout({
        id: 'planned',
        status: 'planned',
        activeSession: true,
      }),
    ];

    expect(findActiveSessionWorkout(workouts)).toBeNull();
  });
});

describe('calculateWorkoutProgress', () => {
  it('returns completed count, total, percent complete, and sets completed', () => {
    const workout = createMockWorkout({
      exercises: [
        createMockWorkoutExercise({
          id: 'we-1',
          completed: true,
          actualSets: 3,
        }),
        createMockWorkoutExercise({
          id: 'we-2',
          completed: false,
          actualSets: 2,
        }),
        createMockWorkoutExercise({
          id: 'we-3',
          completed: true,
          actualSets: 4,
        }),
      ],
    });

    expect(calculateWorkoutProgress(workout)).toEqual({
      completed: 2,
      total: 3,
      percentComplete: 67,
      setsCompleted: 7,
    });
  });

  it('handles zero exercises gracefully', () => {
    expect(calculateWorkoutProgress(createMockWorkout({ exercises: [] }))).toEqual({
      completed: 0,
      total: 0,
      percentComplete: 0,
      setsCompleted: 0,
    });
  });
});
