import { z } from 'zod';

import type { ExerciseStatus } from './exercise.model';
import type { ExerciseFormOutput } from './exerciseForm.schema';

function optionalPositiveIntField(fieldLabel: string) {
  return z
    .string()
    .optional()
    .transform((value, ctx) => {
      const trimmed = value?.trim();

      if (!trimmed) {
        return undefined;
      }

      const parsed = Number.parseInt(trimmed, 10);

      if (Number.isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be a positive whole number.`,
        });
        return z.NEVER;
      }

      return parsed;
    });
}

function optionalNonNegativeNumberField(fieldLabel: string) {
  return z
    .string()
    .optional()
    .transform((value, ctx) => {
      const trimmed = value?.trim();

      if (!trimmed) {
        return undefined;
      }

      const parsed = Number.parseFloat(trimmed);

      if (Number.isNaN(parsed) || parsed < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be zero or greater.`,
        });
        return z.NEVER;
      }

      return parsed;
    });
}

export const exerciseCreateFormSchema = z.object({
  name: z.string().trim().min(1, 'Exercise name is required.'),
  defaultSets: optionalPositiveIntField('Sets'),
  defaultReps: optionalPositiveIntField('Reps'),
  defaultHoldSeconds: optionalPositiveIntField('Hold seconds'),
  defaultWeight: optionalNonNegativeNumberField('Weight'),
});

export type ExerciseCreateFormValues = z.input<typeof exerciseCreateFormSchema>;
export type ExerciseCreateFormOutput = z.output<typeof exerciseCreateFormSchema>;

export const defaultExerciseCreateFormValues: ExerciseCreateFormValues = {
  name: '',
  defaultSets: '',
  defaultReps: '',
  defaultHoldSeconds: '',
  defaultWeight: '',
};

export function createFormToExerciseOutput(
  values: ExerciseCreateFormOutput,
  status: ExerciseStatus
): ExerciseFormOutput {
  return {
    ...values,
    status,
    primaryMuscles: [],
    secondaryMuscles: [],
    type: [],
    purpose: [],
    equipment: [],
  };
}
