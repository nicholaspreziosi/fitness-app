import { getUpcomingWorkouts } from '@/src/contexts/dashboard/domain/dashboardUpcoming';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';

describe('getUpcomingWorkouts', () => {
  const anchorDate = FIXED_DATE;
  const today = FIXED_DATE;

  function upcoming(
    workouts: Parameters<typeof getUpcomingWorkouts>[0],
    viewAnchor: Date = anchorDate
  ) {
    return getUpcomingWorkouts(workouts, 'week', viewAnchor, 1, today);
  }

  it('includes planned workouts', () => {
    const workouts = [createMockWorkout({ id: 'planned', status: 'planned', date: createTestDate(0) })];

    expect(upcoming(workouts).map((w) => w.id)).toEqual(['planned']);
  });

  it('includes inProgress workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'in-progress', status: 'inProgress', date: createTestDate(0) }),
    ];

    expect(upcoming(workouts).map((w) => w.id)).toEqual(['in-progress']);
  });

  it('excludes completed workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'completed', status: 'completed', date: createTestDate(2) }),
    ];

    expect(upcoming(workouts)).toEqual([]);
  });

  it('excludes skipped workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'skipped', status: 'skipped', date: createTestDate(2) }),
    ];

    expect(upcoming(workouts)).toEqual([]);
  });

  it('excludes archived workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'archived', status: 'archived', date: createTestDate(2) }),
    ];

    expect(upcoming(workouts)).toEqual([]);
  });

  it('excludes draft workouts', () => {
    const workouts = [createMockWorkout({ id: 'draft', status: 'draft', date: createTestDate(2) })];

    expect(upcoming(workouts)).toEqual([]);
  });

  it('excludes workouts from earlier days', () => {
    const workouts = [
      createMockWorkout({ id: 'yesterday', status: 'planned', date: createTestDate(-1) }),
      createMockWorkout({ id: 'yesterday-active', status: 'inProgress', date: createTestDate(-1) }),
      createMockWorkout({ id: 'today', status: 'planned', date: createTestDate(0) }),
      createMockWorkout({ id: 'tomorrow', status: 'planned', date: createTestDate(1) }),
    ];

    expect(upcoming(workouts).map((w) => w.id)).toEqual(['today', 'tomorrow']);
  });

  it('sorts by date ascending', () => {
    const workouts = [
      createMockWorkout({ id: 'later', status: 'planned', date: createTestDate(1) }),
      createMockWorkout({ id: 'earlier', status: 'planned', date: createTestDate(0) }),
    ];

    expect(upcoming(workouts).map((w) => w.id)).toEqual(['earlier', 'later']);
  });

  it('respects the selected view range', () => {
    const workouts = [
      createMockWorkout({ id: 'this-week', status: 'planned', date: createTestDate(1) }),
      createMockWorkout({ id: 'next-week', status: 'planned', date: createTestDate(8) }),
    ];

    expect(upcoming(workouts, createTestDate(7)).map((w) => w.id)).toEqual(['next-week']);
  });
});
