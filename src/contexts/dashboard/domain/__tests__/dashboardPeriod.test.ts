import {
  filterWorkoutsByViewMode,
  getDashboardRange,
  getDashboardRangeLabel,
  isDateInViewMode,
} from '@/src/contexts/dashboard/domain/dashboardPeriod';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';
import { getWeekBounds } from '@/src/lib/dates/weekBounds';
import { getMonthBounds } from '@/src/lib/dates/monthBounds';

describe('getDashboardRange', () => {
  const anchorDate = FIXED_DATE;

  it('returns week bounds using the preferred week start day', () => {
    const range = getDashboardRange('week', anchorDate, 0);
    const { weekStart, weekEnd } = getWeekBounds(anchorDate, 0);

    expect(range.start).toEqual(weekStart);
    expect(range.end).toEqual(weekEnd);
  });

  it('returns month bounds for month view', () => {
    const range = getDashboardRange('month', anchorDate);
    const { monthStart, monthEnd } = getMonthBounds(anchorDate);

    expect(range.start).toEqual(monthStart);
    expect(range.end).toEqual(monthEnd);
  });

  it('supports navigating to a different week via anchor date', () => {
    const nextWeekAnchor = createTestDate(7);
    const range = getDashboardRange('week', nextWeekAnchor);
    const { weekStart, weekEnd } = getWeekBounds(nextWeekAnchor);

    expect(range.start).toEqual(weekStart);
    expect(range.end).toEqual(weekEnd);
  });
});

describe('getDashboardRangeLabel', () => {
  it('formats week labels', () => {
    const anchorDate = createTestDate(0);
    const { weekStart, weekEnd } = getWeekBounds(anchorDate, 1);

    expect(getDashboardRangeLabel('week', anchorDate, 1)).toBe(
      `Jun ${weekStart.getDate()} - ${weekEnd.getDate()}`
    );
  });

  it('formats month labels', () => {
    expect(getDashboardRangeLabel('month', FIXED_DATE)).toBe('June 2024');
  });
});

describe('filterWorkoutsByViewMode', () => {
  const anchorDate = FIXED_DATE;

  it('filters workouts for the selected week', () => {
    const inWeek = createMockWorkout({ id: 'in-week', date: createTestDate(1) });
    const outOfWeek = createMockWorkout({ id: 'out-of-week', date: createTestDate(14) });

    const result = filterWorkoutsByViewMode([inWeek, outOfWeek], 'week', anchorDate);

    expect(result.map((workout) => workout.id)).toEqual(['in-week']);
  });

  it('filters workouts for the selected month', () => {
    const inMonth = createMockWorkout({ id: 'in-month', date: createTestDate(5) });
    const outOfMonth = createMockWorkout({ id: 'out-of-month', date: createTestDate(45) });

    const result = filterWorkoutsByViewMode([inMonth, outOfMonth], 'month', anchorDate);

    expect(result.map((workout) => workout.id)).toEqual(['in-month']);
  });

  it('ignores workouts without a date', () => {
    const noDate = createMockWorkout({ id: 'no-date', date: undefined });
    const withDate = createMockWorkout({ id: 'with-date', date: createTestDate(1) });

    const result = filterWorkoutsByViewMode([noDate, withDate], 'week', anchorDate);

    expect(result.map((workout) => workout.id)).toEqual(['with-date']);
  });

  it('ignores archived workouts', () => {
    const archived = createMockWorkout({
      id: 'archived',
      status: 'archived',
      date: createTestDate(1),
    });
    const planned = createMockWorkout({ id: 'planned', status: 'planned', date: createTestDate(1) });

    const result = filterWorkoutsByViewMode([archived, planned], 'week', anchorDate);

    expect(result.map((workout) => workout.id)).toEqual(['planned']);
  });
});

describe('isDateInViewMode', () => {
  const anchorDate = FIXED_DATE;

  it('checks whether a date falls in the selected range', () => {
    expect(isDateInViewMode(createTestDate(1), 'week', anchorDate)).toBe(true);
    expect(isDateInViewMode(createTestDate(14), 'week', anchorDate)).toBe(false);
  });
});
