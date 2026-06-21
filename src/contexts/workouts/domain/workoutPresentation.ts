import type { PrescriptionFormatOptions } from '@/src/lib/prescription/formatPrescription';
import { formatPrescription } from '@/src/lib/prescription/formatPrescription';
import type { WorkoutExercise } from './workout.model';

type PrescriptionSource = Pick<
  WorkoutExercise,
  'plannedSets' | 'plannedReps' | 'plannedWeight' | 'plannedHoldSeconds'
>;

export function formatWorkoutExercisePrescription(
  exercise: PrescriptionSource,
  options: PrescriptionFormatOptions = {}
): string | undefined {
  return formatPrescription(
    {
      sets: exercise.plannedSets,
      reps: exercise.plannedReps,
      weight: exercise.plannedWeight,
      holdSeconds: exercise.plannedHoldSeconds,
    },
    options
  );
}

export function seedActualsFromPlanned(exercise: WorkoutExercise): WorkoutExercise {
  return {
    ...exercise,
    actualSets: exercise.actualSets ?? exercise.plannedSets,
    actualReps: exercise.actualReps ?? exercise.plannedReps,
    actualHoldSeconds: exercise.actualHoldSeconds ?? exercise.plannedHoldSeconds,
    actualWeight: exercise.actualWeight ?? exercise.plannedWeight,
  };
}

export function seedWorkoutActualsFromPlanned(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises.map(seedActualsFromPlanned);
}
