import type { Workout, WorkoutStatus } from '@/src/contexts/workouts/domain/workout.model';
import { isBeforeDay, type WeekStartDay } from '@/src/lib/dates/weekBounds';

import { filterWorkoutsByViewMode } from './dashboardPeriod';
import type { DashboardViewMode } from './dashboard.types';

const UPCOMING_WORKOUT_STATUSES: WorkoutStatus[] = ['planned', 'inProgress'];

export function getUpcomingWorkouts(
  workouts: Workout[],
  viewMode: DashboardViewMode,
  anchorDate: Date = new Date(),
  weekStartDay: WeekStartDay = 1,
  today: Date = new Date()
): Workout[] {
  const inRange = filterWorkoutsByViewMode(workouts, viewMode, anchorDate, weekStartDay);

  return inRange
    .filter(
      (workout) =>
        UPCOMING_WORKOUT_STATUSES.includes(workout.status) &&
        workout.date != null &&
        !isBeforeDay(workout.date, today)
    )
    .sort((a, b) => {
      const aTime = a.date?.getTime() ?? 0;
      const bTime = b.date?.getTime() ?? 0;
      return aTime - bTime;
    });
}
