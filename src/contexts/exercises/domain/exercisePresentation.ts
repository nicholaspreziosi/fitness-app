import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { PrescriptionFormatOptions } from '@/src/lib/prescription/formatPrescription';
import { formatPrescription } from '@/src/lib/prescription/formatPrescription';

export function formatExercisePrescription(
  exercise: Pick<Exercise, 'defaultSets' | 'defaultReps' | 'defaultHoldSeconds' | 'defaultWeight'>,
  options: PrescriptionFormatOptions = {}
): string | undefined {
  return formatPrescription(
    {
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      weight: exercise.defaultWeight,
      holdSeconds: exercise.defaultHoldSeconds,
    },
    options
  );
}
