import { isBeforeDay } from '@/src/lib/dates/weekBounds';

import type { Workout, WorkoutStatus } from './workout.model';

export type WorkoutRuleResult =
  | { allowed: true }
  | { allowed: false; message: string };

const HARD_DELETABLE_STATUSES: WorkoutStatus[] = [
  'draft',
  'planned',
  'inProgress',
  'completed',
  'skipped',
];

const REVERTABLE_TO_PLANNED_STATUSES: WorkoutStatus[] = ['inProgress', 'completed', 'skipped'];

export function isPastWorkoutDate(date: Date, referenceDate: Date = new Date()): boolean {
  return isBeforeDay(date, referenceDate);
}

export function canUsePlannedStatusForWorkout(
  workout: Pick<Workout, 'date' | 'status'>,
  referenceDate: Date = new Date()
): WorkoutRuleResult {
  if (workout.status === 'planned' && isPastWorkoutDate(workout.date, referenceDate)) {
    return { allowed: false, message: 'Past workouts cannot be marked as planned.' };
  }

  return { allowed: true };
}

export function canHardDeleteWorkout(status: WorkoutStatus): boolean {
  return HARD_DELETABLE_STATUSES.includes(status);
}

export function canRevertWorkoutToPlanned(
  workout: Pick<Workout, 'status' | 'date'>,
  referenceDate: Date = new Date()
): WorkoutRuleResult {
  if (isPastWorkoutDate(workout.date, referenceDate)) {
    return { allowed: false, message: 'Past workouts cannot be marked as planned.' };
  }

  if (workout.status === 'archived') {
    return { allowed: false, message: 'Archived workouts cannot be reverted to planned.' };
  }

  if (workout.status === 'draft' || workout.status === 'planned') {
    return { allowed: false, message: 'This workout is already planned.' };
  }

  if (!REVERTABLE_TO_PLANNED_STATUSES.includes(workout.status)) {
    return { allowed: false, message: 'This workout cannot be reverted to planned.' };
  }

  return { allowed: true };
}

export function isVisibleInWeeklyPlanner(workout: Pick<Workout, 'status'>): boolean {
  return workout.status !== 'archived';
}

export function usesEmbeddedWorkoutExercises(workout: Workout): boolean {
  return Array.isArray(workout.exercises);
}
