import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import { formatPrescription } from '@/src/lib/prescription/formatPrescription';

export function formatExercisePrescription(
  exercise: Pick<Exercise, 'defaultSets' | 'defaultReps' | 'defaultHoldSeconds' | 'defaultWeight'>
): string | undefined {
  return formatPrescription({
    sets: exercise.defaultSets,
    reps: exercise.defaultReps,
    weight: exercise.defaultWeight,
    holdSeconds: exercise.defaultHoldSeconds,
  });
}
