import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import type { WeekStartDay } from '@/src/lib/dates/weekBounds';
import { getMonthBounds } from '@/src/lib/dates/monthBounds';
import { addWeeks, endOfDay, getWeekBounds, startOfDay } from '@/src/lib/dates/weekBounds';

import type { DashboardPeriod } from './dashboard.types';

export type PeriodRange = {
  start: Date;
  end: Date;
};

export function getPeriodRange(
  period: DashboardPeriod,
  referenceDate: Date = new Date(),
  weekStartDay: WeekStartDay = 1
): PeriodRange {
  switch (period) {
    case 'thisWeek': {
      const { weekStart, weekEnd } = getWeekBounds(referenceDate, weekStartDay);
      return { start: weekStart, end: weekEnd };
    }
    case 'nextWeek': {
      const { weekStart, weekEnd } = getWeekBounds(addWeeks(referenceDate, 1), weekStartDay);
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
  referenceDate: Date = new Date(),
  weekStartDay: WeekStartDay = 1
): Workout[] {
  const range = getPeriodRange(period, referenceDate, weekStartDay);

  return workouts.filter(
    (workout) => workout.status !== 'archived' && isWorkoutInRange(workout, range)
  );
}

export function getPeriodLabel(
  period: DashboardPeriod,
  referenceDate: Date = new Date(),
  weekStartDay: WeekStartDay = 1
): string {
  const range = getPeriodRange(period, referenceDate, weekStartDay);

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

export function isDateInPeriod(
  date: Date,
  period: DashboardPeriod,
  referenceDate: Date,
  weekStartDay: WeekStartDay = 1
): boolean {
  const range = getPeriodRange(period, referenceDate, weekStartDay);
  const normalized = startOfDay(date);
  return normalized >= range.start && normalized <= endOfDay(range.end);
}
