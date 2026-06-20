import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';

import {
  generateWorkoutExercisesFromExercises as generateFromExercises,
  type GenerateWorkoutExercisesOptions,
} from './planner.helpers';
import type { WorkoutExercise } from './workout.model';

export type { GenerateWorkoutExercisesOptions };

export function generateWorkoutExercisesFromExercises(
  exercises: Exercise[],
  options: GenerateWorkoutExercisesOptions = {}
): WorkoutExercise[] {
  return generateFromExercises(exercises, 0, options);
}
