import type { Workout, WorkoutStatus } from './workout.model';

export function canHardDeleteWorkout(status: WorkoutStatus): boolean {
  return status === 'draft' || status === 'planned';
}

export function shouldArchiveWorkoutInsteadOfDelete(status: WorkoutStatus): boolean {
  return status === 'completed' || status === 'skipped';
}

export function isVisibleInWeeklyPlanner(workout: Pick<Workout, 'status'>): boolean {
  return workout.status !== 'archived';
}

export function usesEmbeddedWorkoutExercises(workout: Workout): boolean {
  return Array.isArray(workout.exercises);
}
