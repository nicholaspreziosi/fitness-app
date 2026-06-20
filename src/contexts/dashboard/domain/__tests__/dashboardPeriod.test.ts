import {
  filterWorkoutsByPeriod,
  getPeriodRange,
  isDateInPeriod,
} from '@/src/contexts/dashboard/domain/dashboardPeriod';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';
import { getWeekBounds } from '@/src/lib/dates/weekBounds';
import { getMonthBounds } from '@/src/lib/dates/monthBounds';

describe('getPeriodRange', () => {
  const referenceDate = FIXED_DATE;

  it('defaults to current week', () => {
    const range = getPeriodRange('thisWeek', referenceDate);
    const { weekStart, weekEnd } = getWeekBounds(referenceDate);

    expect(range.start).toEqual(weekStart);
    expect(range.end).toEqual(weekEnd);
  });

  it('returns next week bounds', () => {
    const range = getPeriodRange('nextWeek', referenceDate);
    const { weekStart, weekEnd } = getWeekBounds(createTestDate(7));

    expect(range.start).toEqual(weekStart);
    expect(range.end).toEqual(weekEnd);
  });

  it('returns this month bounds', () => {
    const range = getPeriodRange('thisMonth', referenceDate);
    const { monthStart, monthEnd } = getMonthBounds(referenceDate);

    expect(range.start).toEqual(monthStart);
    expect(range.end).toEqual(monthEnd);
  });
});

describe('filterWorkoutsByPeriod', () => {
  const referenceDate = FIXED_DATE;

  it('filters workouts for this week', () => {
    const inWeek = createMockWorkout({ id: 'in-week', date: createTestDate(1) });
    const outOfWeek = createMockWorkout({ id: 'out-of-week', date: createTestDate(14) });

    const result = filterWorkoutsByPeriod([inWeek, outOfWeek], 'thisWeek', referenceDate);

    expect(result.map((workout) => workout.id)).toEqual(['in-week']);
  });

  it('filters workouts for next week', () => {
    const thisWeek = createMockWorkout({ id: 'this-week', date: createTestDate(1) });
    const nextWeek = createMockWorkout({ id: 'next-week', date: createTestDate(8) });

    const result = filterWorkoutsByPeriod([thisWeek, nextWeek], 'nextWeek', referenceDate);

    expect(result.map((workout) => workout.id)).toEqual(['next-week']);
  });

  it('filters workouts for this month', () => {
    const inMonth = createMockWorkout({ id: 'in-month', date: createTestDate(5) });
    const outOfMonth = createMockWorkout({ id: 'out-of-month', date: createTestDate(45) });

    const result = filterWorkoutsByPeriod([inMonth, outOfMonth], 'thisMonth', referenceDate);

    expect(result.map((workout) => workout.id)).toEqual(['in-month']);
  });

  it('ignores workouts without a date', () => {
    const noDate = createMockWorkout({ id: 'no-date', date: undefined });
    const withDate = createMockWorkout({ id: 'with-date', date: createTestDate(1) });

    const result = filterWorkoutsByPeriod([noDate, withDate], 'thisWeek', referenceDate);

    expect(result.map((workout) => workout.id)).toEqual(['with-date']);
  });

  it('ignores archived workouts', () => {
    const archived = createMockWorkout({
      id: 'archived',
      status: 'archived',
      date: createTestDate(1),
    });
    const planned = createMockWorkout({ id: 'planned', status: 'planned', date: createTestDate(1) });

    const result = filterWorkoutsByPeriod([archived, planned], 'thisWeek', referenceDate);

    expect(result.map((workout) => workout.id)).toEqual(['planned']);
  });
});

describe('isDateInPeriod', () => {
  const referenceDate = FIXED_DATE;

  it('checks whether a date falls in the selected period', () => {
    expect(isDateInPeriod(createTestDate(1), 'thisWeek', referenceDate)).toBe(true);
    expect(isDateInPeriod(createTestDate(14), 'thisWeek', referenceDate)).toBe(false);
  });
});
