import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type {
  ExerciseFormOutput,
  ExerciseFormValues,
} from '@/src/contexts/exercises/domain/exerciseForm.schema';
import { defaultExerciseFormValues } from '@/src/contexts/exercises/domain/exerciseForm.schema';

function numberFieldToString(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

export function exerciseToFormValues(exercise: Exercise): ExerciseFormValues {
  return {
    name: exercise.name,
    status: exercise.status,
    bodyPart: exercise.bodyPart,
    primaryMuscles: exercise.primaryMuscles ?? [],
    secondaryMuscles: exercise.secondaryMuscles ?? [],
    type: exercise.type ?? [],
    purpose: exercise.purpose ?? [],
    equipment: exercise.equipment ?? [],
    defaultSets: numberFieldToString(exercise.defaultSets),
    defaultReps: numberFieldToString(exercise.defaultReps),
    defaultHoldSeconds: numberFieldToString(exercise.defaultHoldSeconds),
    defaultWeight: numberFieldToString(exercise.defaultWeight),
    notes: exercise.notes ?? '',
  };
}

export function formOutputToExerciseFields(
  values: ExerciseFormOutput
): Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'favorite'> {
  return {
    name: values.name,
    status: values.status,
    bodyPart: values.bodyPart,
    primaryMuscles: values.primaryMuscles?.length ? values.primaryMuscles : undefined,
    secondaryMuscles: values.secondaryMuscles?.length ? values.secondaryMuscles : undefined,
    type: values.type?.length ? values.type : undefined,
    purpose: values.purpose?.length ? values.purpose : undefined,
    equipment: values.equipment?.length ? values.equipment : undefined,
    defaultSets: values.defaultSets,
    defaultReps: values.defaultReps,
    defaultHoldSeconds: values.defaultHoldSeconds,
    defaultWeight: values.defaultWeight,
    notes: values.notes,
  };
}

export function createEmptyExerciseFormValues(
  overrides: Partial<ExerciseFormValues> = {}
): ExerciseFormValues {
  return {
    ...defaultExerciseFormValues,
    ...overrides,
  };
}
