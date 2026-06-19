import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';

export function formatExercisePrescription(
  exercise: Pick<Exercise, 'defaultSets' | 'defaultReps' | 'defaultHoldSeconds' | 'defaultWeight'>
): string | undefined {
  const { defaultSets, defaultReps, defaultHoldSeconds, defaultWeight } = exercise;

  if (
    defaultHoldSeconds &&
    defaultSets === undefined &&
    defaultReps === undefined &&
    defaultWeight === undefined
  ) {
    return `${defaultHoldSeconds}s hold`;
  }

  if (
    defaultSets === undefined &&
    defaultReps === undefined &&
    defaultHoldSeconds === undefined &&
    defaultWeight === undefined
  ) {
    return undefined;
  }

  const segments: string[] = [];

  if (defaultSets !== undefined && defaultReps !== undefined) {
    segments.push(`${defaultSets} × ${defaultReps}`);
  } else if (defaultSets !== undefined) {
    segments.push(`${defaultSets} sets`);
  } else if (defaultReps !== undefined) {
    segments.push(`${defaultReps} reps`);
  }

  if (defaultWeight !== undefined) {
    segments.push(`@ ${defaultWeight} lbs`);
  }

  return segments.length > 0 ? segments.join(' ') : undefined;
}
