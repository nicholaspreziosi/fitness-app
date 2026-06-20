import { DashboardService } from '@/src/contexts/dashboard/application/dashboard.service';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';

describe('DashboardService', () => {
  const service = new DashboardService();
  const referenceDate = FIXED_DATE;

  it('getDashboardSummary returns the full summary shape', () => {
    const workouts = [
      createMockWorkout({
        status: 'completed',
        date: createTestDate(1),
        exercises: [
          createMockWorkoutExercise({ bodyPart: 'Core', completed: true }),
          createMockWorkoutExercise({ id: 'we-2', completed: false }),
        ],
      }),
      createMockWorkout({
        id: 'workout-2',
        status: 'planned',
        date: createTestDate(0),
        exercises: [createMockWorkoutExercise({ id: 'we-3', completed: false })],
      }),
    ];

    const summary = service.getDashboardSummary(workouts, 'thisWeek', referenceDate);

    expect(summary).toMatchObject({
      period: 'thisWeek',
      periodLabel: 'This Week',
      workoutStats: { completed: 1, total: 2 },
      exerciseStats: { completed: 1, total: 3 },
      completionPercentage: 33,
      coverage: [{ bodyPart: 'Core', count: 1 }],
      upcoming: [expect.objectContaining({ id: 'workout-2' })],
      emptyStates: {
        noWorkouts: false,
        noCompletedData: false,
        noUpcoming: false,
        noChartData: false,
      },
    });
  });

  it('getCompletionStats returns workout and exercise stats', () => {
    const workouts = [
      createMockWorkout({
        status: 'completed',
        exercises: [
          createMockWorkoutExercise({ completed: true }),
          createMockWorkoutExercise({ id: 'we-2', completed: false }),
        ],
      }),
    ];

    expect(service.getCompletionStats(workouts)).toEqual({
      workoutStats: { completed: 1, total: 1 },
      exerciseStats: { completed: 1, total: 2 },
    });
  });

  it('getCompletionPercentage returns exercise completion percentage', () => {
    const workouts = [
      createMockWorkout({
        status: 'planned',
        exercises: [
          createMockWorkoutExercise({ completed: true }),
          createMockWorkoutExercise({ id: 'we-2', completed: false }),
        ],
      }),
    ];

    expect(service.getCompletionPercentage(workouts)).toBe(50);
  });

  it('getCoverageData returns sorted body part coverage', () => {
    const workouts = [
      createMockWorkout({
        status: 'completed',
        exercises: [
          createMockWorkoutExercise({ bodyPart: 'Core', completed: true }),
          createMockWorkoutExercise({ id: 'we-2', bodyPart: 'Shoulders', completed: true }),
          createMockWorkoutExercise({ id: 'we-3', bodyPart: 'Shoulders', completed: true }),
        ],
      }),
    ];

    expect(service.getCoverageData(workouts)).toEqual([
      { bodyPart: 'Shoulders', count: 2 },
      { bodyPart: 'Core', count: 1 },
    ]);
  });

  it('getUpcomingWorkouts returns filtered upcoming workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'planned', status: 'planned', date: createTestDate(0) }),
      createMockWorkout({ id: 'completed', status: 'completed', date: createTestDate(1) }),
    ];

    expect(service.getUpcomingWorkouts(workouts, 'thisWeek', referenceDate).map((w) => w.id)).toEqual(
      ['planned']
    );
  });

  it('does not mutate workouts', () => {
    const workouts = [
      createMockWorkout({
        status: 'planned',
        date: createTestDate(1),
        exercises: [createMockWorkoutExercise({ completed: false })],
      }),
    ];
    const snapshot = JSON.stringify(workouts);

    service.getDashboardSummary(workouts, 'thisWeek', referenceDate);

    expect(JSON.stringify(workouts)).toBe(snapshot);
  });

  it('excludes deleted completed workouts from dashboard metrics', () => {
    const completedWorkout = createMockWorkout({
      id: 'completed-1',
      status: 'completed',
      date: createTestDate(1),
      exercises: [
        createMockWorkoutExercise({ bodyPart: 'Core', completed: true }),
        createMockWorkoutExercise({ id: 'we-2', bodyPart: 'Core', completed: true }),
      ],
    });
    const plannedWorkout = createMockWorkout({
      id: 'planned-1',
      status: 'planned',
      date: createTestDate(0),
      exercises: [createMockWorkoutExercise({ id: 'we-3', completed: false })],
    });

    const withCompleted = service.getDashboardSummary(
      [completedWorkout, plannedWorkout],
      'thisWeek',
      referenceDate
    );
    const withoutCompleted = service.getDashboardSummary(
      [plannedWorkout],
      'thisWeek',
      referenceDate
    );

    expect(withCompleted.workoutStats).toEqual({ completed: 1, total: 2 });
    expect(withCompleted.exerciseStats).toEqual({ completed: 2, total: 3 });
    expect(withCompleted.coverage).toEqual([{ bodyPart: 'Core', count: 2 }]);

    expect(withoutCompleted.workoutStats).toEqual({ completed: 0, total: 1 });
    expect(withoutCompleted.exerciseStats).toEqual({ completed: 0, total: 1 });
    expect(withoutCompleted.coverage).toEqual([]);
    expect(withoutCompleted.emptyStates.noCompletedData).toBe(true);
    expect(withoutCompleted.emptyStates.noChartData).toBe(true);
  });

  it('returns stable empty defaults', () => {
    const summary = service.getDashboardSummary([], 'thisWeek', referenceDate);

    expect(summary).toEqual({
      period: 'thisWeek',
      periodLabel: 'This Week',
      workoutStats: { completed: 0, total: 0 },
      exerciseStats: { completed: 0, total: 0 },
      completionPercentage: 0,
      coverage: [],
      upcoming: [],
      emptyStates: {
        noWorkouts: true,
        noCompletedData: true,
        noUpcoming: true,
        noChartData: true,
      },
    });
  });
});
