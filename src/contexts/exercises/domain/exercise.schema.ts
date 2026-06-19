import { z } from 'zod';

import {
  BODY_PARTS,
  EQUIPMENT_OPTIONS,
  EXERCISE_PURPOSES,
  EXERCISE_STATUSES,
  EXERCISE_TYPES,
  MUSCLES,
} from './exercise.model';

const bodyPartSchema = z.enum(BODY_PARTS);
const muscleSchema = z.enum(MUSCLES);
const exerciseStatusSchema = z.enum(EXERCISE_STATUSES);
const exerciseTypeSchema = z.enum(EXERCISE_TYPES);
const exercisePurposeSchema = z.enum(EXERCISE_PURPOSES);
const equipmentSchema = z.enum(EQUIPMENT_OPTIONS);

export const exerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: exerciseStatusSchema,
  favorite: z.boolean().optional(),
  bodyPart: bodyPartSchema.optional(),
  primaryMuscles: z.array(muscleSchema).optional(),
  secondaryMuscles: z.array(muscleSchema).optional(),
  otherPrimaryMuscles: z.array(z.string()).optional(),
  otherSecondaryMuscles: z.array(z.string()).optional(),
  type: z.array(exerciseTypeSchema).optional(),
  purpose: z.array(exercisePurposeSchema).optional(),
  equipment: z.array(equipmentSchema).optional(),
  otherEquipment: z.array(z.string()).optional(),
  defaultSets: z.number().int().positive().optional(),
  defaultReps: z.number().int().positive().optional(),
  defaultHoldSeconds: z.number().int().positive().optional(),
  defaultWeight: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
