import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import { createId } from '@/src/lib/id/createId';

import type { WorkoutExercise } from './workout.model';

export type GenerateWorkoutExercisesOptions = {
  includeArchived?: boolean;
};

export function generateWorkoutExercisesFromExercises(
  exercises: Exercise[],
  options: GenerateWorkoutExercisesOptions = {}
): WorkoutExercise[] {
  const { includeArchived = false } = options;

  return exercises
    .filter((exercise) => includeArchived || exercise.status !== 'archived')
    .map((exercise, index) => exerciseToWorkoutExercise(exercise, index));
}

function exerciseToWorkoutExercise(exercise: Exercise, sortOrder: number): WorkoutExercise {
  return {
    id: createId('workout-exercise'),
    sortOrder,
    exerciseId: exercise.id,
    bodyPart: exercise.bodyPart,
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    plannedSets: exercise.defaultSets,
    plannedReps: exercise.defaultReps,
    plannedHoldSeconds: exercise.defaultHoldSeconds,
    plannedWeight: exercise.defaultWeight,
    completed: false,
  };
}
