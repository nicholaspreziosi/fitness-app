import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { getMonthBounds } from '@/src/lib/dates/monthBounds';
import { addWeeks, endOfDay, getWeekBounds, startOfDay } from '@/src/lib/dates/weekBounds';

import type { DashboardPeriod } from './dashboard.types';

export type PeriodRange = {
  start: Date;
  end: Date;
};

export function getPeriodRange(
  period: DashboardPeriod,
  referenceDate: Date = new Date()
): PeriodRange {
  switch (period) {
    case 'thisWeek': {
      const { weekStart, weekEnd } = getWeekBounds(referenceDate);
      return { start: weekStart, end: weekEnd };
    }
    case 'nextWeek': {
      const { weekStart, weekEnd } = getWeekBounds(addWeeks(referenceDate, 1));
      return { start: weekStart, end: weekEnd };
    }
    case 'thisMonth': {
      const { monthStart, monthEnd } = getMonthBounds(referenceDate);
      return { start: monthStart, end: monthEnd };
    }
  }
}

function isWorkoutInRange(workout: Workout, range: PeriodRange): boolean {
  if (!workout.date) {
    return false;
  }

  const workoutDate = startOfDay(workout.date);
  return workoutDate >= range.start && workoutDate <= range.end;
}

export function filterWorkoutsByPeriod(
  workouts: Workout[],
  period: DashboardPeriod,
  referenceDate: Date = new Date()
): Workout[] {
  const range = getPeriodRange(period, referenceDate);

  return workouts.filter(
    (workout) => workout.status !== 'archived' && isWorkoutInRange(workout, range)
  );
}

export function getPeriodLabel(period: DashboardPeriod, referenceDate: Date = new Date()): string {
  const range = getPeriodRange(period, referenceDate);

  switch (period) {
    case 'thisWeek':
      return 'This Week';
    case 'nextWeek':
      return 'Next Week';
    case 'thisMonth': {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return monthNames[range.start.getMonth()] ?? 'This Month';
    }
  }
}

export function isDateInPeriod(date: Date, period: DashboardPeriod, referenceDate: Date): boolean {
  const range = getPeriodRange(period, referenceDate);
  const normalized = startOfDay(date);
  return normalized >= range.start && normalized <= endOfDay(range.end);
}
