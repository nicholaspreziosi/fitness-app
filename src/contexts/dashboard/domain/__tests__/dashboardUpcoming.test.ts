import { getUpcomingWorkouts } from '@/src/contexts/dashboard/domain/dashboardUpcoming';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';

describe('getUpcomingWorkouts', () => {
  const referenceDate = FIXED_DATE;

  it('includes planned workouts', () => {
    const workouts = [createMockWorkout({ id: 'planned', status: 'planned', date: createTestDate(0) })];

    expect(getUpcomingWorkouts(workouts, 'thisWeek', referenceDate).map((w) => w.id)).toEqual([
      'planned',
    ]);
  });

  it('includes inProgress workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'in-progress', status: 'inProgress', date: createTestDate(0) }),
    ];

    expect(getUpcomingWorkouts(workouts, 'thisWeek', referenceDate).map((w) => w.id)).toEqual([
      'in-progress',
    ]);
  });

  it('excludes completed workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'completed', status: 'completed', date: createTestDate(2) }),
    ];

    expect(getUpcomingWorkouts(workouts, 'thisWeek', referenceDate)).toEqual([]);
  });

  it('excludes skipped workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'skipped', status: 'skipped', date: createTestDate(2) }),
    ];

    expect(getUpcomingWorkouts(workouts, 'thisWeek', referenceDate)).toEqual([]);
  });

  it('excludes archived workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'archived', status: 'archived', date: createTestDate(2) }),
    ];

    expect(getUpcomingWorkouts(workouts, 'thisWeek', referenceDate)).toEqual([]);
  });

  it('excludes draft workouts', () => {
    const workouts = [createMockWorkout({ id: 'draft', status: 'draft', date: createTestDate(2) })];

    expect(getUpcomingWorkouts(workouts, 'thisWeek', referenceDate)).toEqual([]);
  });

  it('sorts by date ascending', () => {
    const workouts = [
      createMockWorkout({ id: 'later', status: 'planned', date: createTestDate(1) }),
      createMockWorkout({ id: 'earlier', status: 'planned', date: createTestDate(0) }),
    ];

    expect(getUpcomingWorkouts(workouts, 'thisWeek', referenceDate).map((w) => w.id)).toEqual([
      'earlier',
      'later',
    ]);
  });

  it('respects the selected period', () => {
    const workouts = [
      createMockWorkout({ id: 'this-week', status: 'planned', date: createTestDate(1) }),
      createMockWorkout({ id: 'next-week', status: 'planned', date: createTestDate(8) }),
    ];

    expect(getUpcomingWorkouts(workouts, 'nextWeek', referenceDate).map((w) => w.id)).toEqual([
      'next-week',
    ]);
  });
});
