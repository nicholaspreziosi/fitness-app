import type { WorkoutExercise } from './workout.model';

const BASE_MINUTES_PER_EXERCISE = 5;
const MINUTES_PER_SET = 2;

export function estimateWorkoutDuration(exercises: WorkoutExercise[]): number {
  if (exercises.length === 0) {
    return 0;
  }

  const totalSets = exercises.reduce((sum, exercise) => sum + (exercise.plannedSets ?? 2), 0);

  return exercises.length * BASE_MINUTES_PER_EXERCISE + totalSets * MINUTES_PER_SET;
}

export function formatEstimatedDuration(minutes: number): string {
  if (minutes === 0) {
    return '~0 min';
  }

  return `~${minutes} min`;
}
