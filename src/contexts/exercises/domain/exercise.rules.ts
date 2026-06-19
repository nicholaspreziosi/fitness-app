import type { Exercise } from './exercise.model';

export function canHardDeleteExercise(hasBeenUsed: boolean): boolean {
  return !hasBeenUsed;
}

export function shouldArchiveExerciseInsteadOfDelete(hasBeenUsed: boolean): boolean {
  return hasBeenUsed;
}

export function isSelectableExercise(exercise: Pick<Exercise, 'status'>): boolean {
  return exercise.status !== 'archived';
}
