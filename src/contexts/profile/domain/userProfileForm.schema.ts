import { z } from 'zod';

import {
  ACCOUNT_STATUSES,
  ACTIVITY_LEVELS,
  FITNESS_LEVELS,
  GENDERS,
  MEASUREMENT_SYSTEMS,
  WEEK_START_DAYS,
  type MeasurementSystem,
  type WeekStartDay,
} from './userProfile.model';

function optionalPositiveNumberField(fieldLabel: string) {
  return z
    .string()
    .optional()
    .transform((value, ctx) => {
      const trimmed = value?.trim();

      if (!trimmed) {
        return undefined;
      }

      const parsed = Number.parseFloat(trimmed);

      if (Number.isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be a positive number.`,
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

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

export const userProfileFormSchema = z.object({
  accountStatus: z.enum(ACCOUNT_STATUSES),
  firstName: optionalTrimmedString,
  lastName: optionalTrimmedString,
  phone: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ?? '';
    })
    .refine(
      (value) => value === '' || /^\+?[0-9\s\-().]{7,20}$/.test(value),
      'Enter a valid phone number.'
    ),
  language: optionalTrimmedString,
  country: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim().toUpperCase();
      return trimmed ?? '';
    })
    .refine(
      (value) => value === '' || /^[A-Z]{2}$/.test(value),
      'Country must be a 2-letter code.'
    ),
  timeZone: optionalTrimmedString,
  weekStartDay: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ?? '';
    })
    .refine(
      (value) => value === '' || WEEK_START_DAYS.map(String).includes(value),
      'Select a valid week start day.'
    ),
  gender: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ?? '';
    })
    .refine(
      (value) => value === '' || (GENDERS as readonly string[]).includes(value),
      'Select a valid gender.'
    ),
  height: optionalPositiveNumberField('Height'),
  weight: optionalNonNegativeNumberField('Weight'),
  activityLevel: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ?? '';
    })
    .refine(
      (value) => value === '' || (ACTIVITY_LEVELS as readonly string[]).includes(value),
      'Select a valid activity level.'
    ),
  fitnessLevel: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ?? '';
    })
    .refine(
      (value) => value === '' || (FITNESS_LEVELS as readonly string[]).includes(value),
      'Select a valid fitness level.'
    ),
  measurementSystem: z.enum(MEASUREMENT_SYSTEMS),
});

export type UserProfileFormValues = z.input<typeof userProfileFormSchema>;
export type UserProfileFormOutput = z.output<typeof userProfileFormSchema>;

export function emptyUserProfileFormValues(
  measurementSystem: MeasurementSystem = 'imperial'
): UserProfileFormValues {
  return {
    accountStatus: 'active',
    firstName: '',
    lastName: '',
    phone: '',
    language: '',
    country: '',
    timeZone: '',
    weekStartDay: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    fitnessLevel: '',
    measurementSystem,
  };
}

export function weekStartDayToFormValue(weekStartDay?: WeekStartDay): string {
  return weekStartDay === undefined ? '' : String(weekStartDay);
}
