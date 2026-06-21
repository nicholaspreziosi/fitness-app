export const ACCOUNT_STATUSES = ['active', 'paused'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const GENDERS = ['male', 'female', 'non_binary', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

export const ACTIVITY_LEVELS = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extra_active',
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced', 'elite'] as const;
export type FitnessLevel = (typeof FITNESS_LEVELS)[number];

export const MEASUREMENT_SYSTEMS = ['imperial', 'metric'] as const;
export type MeasurementSystem = (typeof MEASUREMENT_SYSTEMS)[number];

export const WEEK_START_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
export type WeekStartDay = (typeof WEEK_START_DAYS)[number];

export const WEEK_START_DAY_LABELS: Record<WeekStartDay, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extra_active: 'Extra Active',
};

export const FITNESS_LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
};

export interface UserProfile {
  id: string;
  accountStatus: AccountStatus;
  firstName?: string;
  lastName?: string;
  phone?: string;
  language?: string;
  country?: string;
  timeZone?: string;
  weekStartDay?: WeekStartDay;
  gender?: Gender;
  heightInches?: number;
  weightLbs?: number;
  activityLevel?: ActivityLevel;
  fitnessLevel?: FitnessLevel;
  measurementSystem?: MeasurementSystem;
  createdAt: Date;
  updatedAt: Date;
}

export type UserProfileUpdate = Partial<
  Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
>;
