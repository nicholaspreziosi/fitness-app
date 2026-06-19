import { z } from 'zod';

import {
  BODY_PARTS,
  EQUIPMENT_OPTIONS,
  EXERCISE_PURPOSES,
  EXERCISE_STATUSES,
  EXERCISE_TYPES,
  MUSCLES,
} from './exercise.model';

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

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

export const exerciseFormSchema = z.object({
  name: z.string().trim().min(1, 'Exercise name is required.'),
  status: z.enum(EXERCISE_STATUSES),
  bodyPart: z.enum(BODY_PARTS).optional(),
  primaryMuscles: z.array(z.enum(MUSCLES)).optional(),
  secondaryMuscles: z.array(z.enum(MUSCLES)).optional(),
  type: z.array(z.enum(EXERCISE_TYPES)).optional(),
  purpose: z.array(z.enum(EXERCISE_PURPOSES)).optional(),
  equipment: z.array(z.enum(EQUIPMENT_OPTIONS)).optional(),
  defaultSets: optionalPositiveIntField('Sets'),
  defaultReps: optionalPositiveIntField('Reps'),
  defaultHoldSeconds: optionalPositiveIntField('Hold seconds'),
  defaultWeight: optionalNonNegativeNumberField('Weight'),
  notes: optionalTrimmedString,
});

export type ExerciseFormValues = z.input<typeof exerciseFormSchema>;
export type ExerciseFormOutput = z.output<typeof exerciseFormSchema>;

export const defaultExerciseFormValues: ExerciseFormValues = {
  name: '',
  status: 'draft',
  primaryMuscles: [],
  secondaryMuscles: [],
  type: [],
  purpose: [],
  equipment: [],
  defaultSets: '',
  defaultReps: '',
  defaultHoldSeconds: '',
  defaultWeight: '',
  notes: '',
};
