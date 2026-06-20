import type { Workout, WorkoutStatus } from '@/src/contexts/workouts/domain/workout.model';

import type { CompletionStats } from './dashboard.types';

const COMPLETION_STAT_WORKOUT_STATUSES: WorkoutStatus[] = ['planned', 'inProgress', 'completed'];

function isCountableForCompletionStats(workout: Workout): boolean {
  return (
    workout.status !== 'archived' && COMPLETION_STAT_WORKOUT_STATUSES.includes(workout.status)
  );
}

export function calculateWorkoutCompletionStats(workouts: Workout[]): CompletionStats {
  const countable = workouts.filter(isCountableForCompletionStats);

  return {
    completed: countable.filter((workout) => workout.status === 'completed').length,
    total: countable.length,
  };
}

export function calculateExerciseCompletionStats(workouts: Workout[]): CompletionStats {
  const countable = workouts.filter(isCountableForCompletionStats);

  return countable.reduce<CompletionStats>(
    (stats, workout) => {
      const completedInWorkout = workout.exercises.filter((exercise) => exercise.completed).length;

      return {
        completed: stats.completed + completedInWorkout,
        total: stats.total + workout.exercises.length,
      };
    },
    { completed: 0, total: 0 }
  );
}

export function calculateExerciseCompletionPercentage(workouts: Workout[]): number {
  const { completed, total } = calculateExerciseCompletionStats(workouts);

  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}
