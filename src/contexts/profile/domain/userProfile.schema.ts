import { z } from 'zod';

import {
  ACCOUNT_STATUSES,
  ACTIVITY_LEVELS,
  FITNESS_LEVELS,
  GENDERS,
  MEASUREMENT_SYSTEMS,
} from './userProfile.model';

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

const phoneSchema = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  })
  .refine(
    (value) => value === undefined || /^\+?[0-9\s\-().]{7,20}$/.test(value),
    'Enter a valid phone number.'
  );

const weekStartDaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const userProfileSchema = z.object({
  id: z.string().min(1),
  accountStatus: z.enum(ACCOUNT_STATUSES),
  firstName: optionalTrimmedString,
  lastName: optionalTrimmedString,
  phone: phoneSchema,
  language: optionalTrimmedString,
  country: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim().toUpperCase();
      return trimmed ? trimmed : undefined;
    })
    .refine((value) => value === undefined || /^[A-Z]{2}$/.test(value), 'Country must be a 2-letter code.'),
  timeZone: optionalTrimmedString,
  weekStartDay: weekStartDaySchema.optional(),
  gender: z.enum(GENDERS).optional(),
  heightInches: z.number().positive().optional(),
  weightLbs: z.number().nonnegative().optional(),
  activityLevel: z.enum(ACTIVITY_LEVELS).optional(),
  fitnessLevel: z.enum(FITNESS_LEVELS).optional(),
  measurementSystem: z.enum(MEASUREMENT_SYSTEMS).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const userProfileUpdateSchema = userProfileSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
