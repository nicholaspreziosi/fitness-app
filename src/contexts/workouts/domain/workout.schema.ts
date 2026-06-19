import { z } from 'zod';

import { BODY_PARTS, MUSCLES } from '@/src/contexts/exercises/domain/exercise.model';

import { WORKOUT_STATUSES } from './workout.model';

const bodyPartSchema = z.enum(BODY_PARTS);
const muscleSchema = z.enum(MUSCLES);
const workoutStatusSchema = z.enum(WORKOUT_STATUSES);

export const workoutExerciseSchema = z.object({
  id: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  exerciseId: z.string().min(1),
  bodyPart: bodyPartSchema.optional(),
  primaryMuscles: z.array(muscleSchema).optional(),
  secondaryMuscles: z.array(muscleSchema).optional(),
  plannedSets: z.number().int().positive().optional(),
  plannedReps: z.number().int().positive().optional(),
  plannedHoldSeconds: z.number().int().positive().optional(),
  plannedWeight: z.number().nonnegative().optional(),
  actualSets: z.number().int().positive().optional(),
  actualReps: z.number().int().positive().optional(),
  actualHoldSeconds: z.number().int().positive().optional(),
  actualWeight: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  completed: z.boolean(),
});

export const workoutSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
    date: z.date().optional(),
    status: workoutStatusSchema,
    exercises: z.array(workoutExerciseSchema),
    sourceTemplateBlockIds: z.array(z.string().min(1)).optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const requiresDate = data.status !== 'draft';

    if (requiresDate && !data.date) {
      ctx.addIssue({
        code: 'custom',
        message: 'Workouts with this status require a date.',
        path: ['date'],
      });
    }
  });

export type WorkoutExerciseInput = z.infer<typeof workoutExerciseSchema>;
export type WorkoutInput = z.infer<typeof workoutSchema>;
