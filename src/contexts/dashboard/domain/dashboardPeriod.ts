import { formatMonthLabel, getMonthBounds } from '@/src/lib/dates/monthBounds';
import {
  endOfDay,
  formatWeekLabel,
  getWeekBounds,
  startOfDay,
  type WeekStartDay,
} from '@/src/lib/dates/weekBounds';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';

import type { DashboardViewMode } from './dashboard.types';

export type DashboardRange = {
  start: Date;
  end: Date;
};

export function getDashboardRange(
  viewMode: DashboardViewMode,
  anchorDate: Date = new Date(),
  weekStartDay: WeekStartDay = 1
): DashboardRange {
  switch (viewMode) {
    case 'week': {
      const { weekStart, weekEnd } = getWeekBounds(anchorDate, weekStartDay);
      return { start: weekStart, end: weekEnd };
    }
    case 'month': {
      const { monthStart, monthEnd } = getMonthBounds(anchorDate);
      return { start: monthStart, end: monthEnd };
    }
  }
}

function isWorkoutInRange(workout: Workout, range: DashboardRange): boolean {
  if (!workout.date) {
    return false;
  }

  const workoutDate = startOfDay(workout.date);
  return workoutDate >= range.start && workoutDate <= range.end;
}

export function filterWorkoutsByViewMode(
  workouts: Workout[],
  viewMode: DashboardViewMode,
  anchorDate: Date = new Date(),
  weekStartDay: WeekStartDay = 1
): Workout[] {
  const range = getDashboardRange(viewMode, anchorDate, weekStartDay);

  return workouts.filter(
    (workout) => workout.status !== 'archived' && isWorkoutInRange(workout, range)
  );
}

export function getDashboardRangeLabel(
  viewMode: DashboardViewMode,
  anchorDate: Date = new Date(),
  weekStartDay: WeekStartDay = 1
): string {
  switch (viewMode) {
    case 'week': {
      const { weekStart, weekEnd } = getWeekBounds(anchorDate, weekStartDay);
      return formatWeekLabel(weekStart, weekEnd);
    }
    case 'month':
      return formatMonthLabel(anchorDate);
  }
}

export function isDateInViewMode(
  date: Date,
  viewMode: DashboardViewMode,
  anchorDate: Date,
  weekStartDay: WeekStartDay = 1
): boolean {
  const range = getDashboardRange(viewMode, anchorDate, weekStartDay);
  const normalized = startOfDay(date);
  return normalized >= range.start && normalized <= endOfDay(range.end);
}
