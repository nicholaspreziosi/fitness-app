import { isSameDay } from '@/src/lib/dates/weekBounds';

import type { Workout } from './workout.model';

export type WorkoutProgress = {
  completed: number;
  total: number;
  percentComplete: number;
  setsCompleted: number;
};

const ACTIVE_LIST_STATUSES = new Set<Workout['status']>(['planned', 'inProgress']);

export function filterActiveWorkoutsForDate(workouts: Workout[], date: Date): Workout[] {
  return workouts.filter(
    (workout) => ACTIVE_LIST_STATUSES.has(workout.status) && isSameDay(workout.date, date)
  );
}

export function findActiveSessionWorkout(workouts: Workout[]): Workout | null {
  return (
    workouts.find(
      (workout) => workout.status === 'inProgress' && workout.activeSession === true
    ) ?? null
  );
}

export function calculateWorkoutProgress(workout: Pick<Workout, 'exercises'>): WorkoutProgress {
  const total = workout.exercises.length;
  const completed = workout.exercises.filter((exercise) => exercise.completed).length;
  const setsCompleted = workout.exercises.reduce(
    (sum, exercise) => sum + (exercise.completed ? (exercise.actualSets ?? 0) : 0),
    0
  );
  const percentComplete = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentComplete,
    setsCompleted,
  };
}
