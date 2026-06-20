import type { Workout, WorkoutStatus } from '@/src/contexts/workouts/domain/workout.model';

import { filterWorkoutsByPeriod } from './dashboardPeriod';
import type { DashboardPeriod } from './dashboard.types';

const UPCOMING_WORKOUT_STATUSES: WorkoutStatus[] = ['planned', 'inProgress'];

export function getUpcomingWorkouts(
  workouts: Workout[],
  period: DashboardPeriod,
  referenceDate: Date = new Date()
): Workout[] {
  const inPeriod = filterWorkoutsByPeriod(workouts, period, referenceDate);

  return inPeriod
    .filter((workout) => UPCOMING_WORKOUT_STATUSES.includes(workout.status))
    .sort((a, b) => {
      const aTime = a.date?.getTime() ?? 0;
      const bTime = b.date?.getTime() ?? 0;
      return aTime - bTime;
    });
}
