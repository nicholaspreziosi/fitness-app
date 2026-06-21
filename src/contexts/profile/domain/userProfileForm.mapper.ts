import { cmToInches, inchesToCm, kgToLbs, lbsToKg } from '@/src/lib/measurements/convert';
import type { MeasurementSystem } from './userProfile.model';
import type { UserProfile, UserProfileUpdate } from './userProfile.model';
import type { UserProfileFormOutput, UserProfileFormValues } from './userProfileForm.schema';
import { emptyUserProfileFormValues, weekStartDayToFormValue } from './userProfileForm.schema';

export function userProfileToFormValues(profile: UserProfile): UserProfileFormValues {
  const measurementSystem = profile.measurementSystem ?? 'imperial';

  return {
    accountStatus: profile.accountStatus,
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    phone: profile.phone ?? '',
    language: profile.language ?? '',
    country: profile.country ?? '',
    timeZone: profile.timeZone ?? '',
    weekStartDay: weekStartDayToFormValue(profile.weekStartDay),
    gender: profile.gender ?? '',
    height: formatHeightForForm(profile.heightInches, measurementSystem),
    weight: formatWeightForForm(profile.weightLbs, measurementSystem),
    activityLevel: profile.activityLevel ?? '',
    fitnessLevel: profile.fitnessLevel ?? '',
    measurementSystem,
  };
}

export function formOutputToProfileUpdate(output: UserProfileFormOutput): UserProfileUpdate {
  return {
    accountStatus: output.accountStatus,
    firstName: output.firstName,
    lastName: output.lastName,
    phone: output.phone || undefined,
    language: output.language,
    country: output.country || undefined,
    timeZone: output.timeZone,
    weekStartDay:
      output.weekStartDay === '' ? undefined : (Number.parseInt(output.weekStartDay, 10) as UserProfile['weekStartDay']),
    gender: output.gender === '' ? undefined : (output.gender as UserProfile['gender']),
    heightInches: parseHeightFromForm(output.height, output.measurementSystem),
    weightLbs: parseWeightFromForm(output.weight, output.measurementSystem),
    activityLevel:
      output.activityLevel === '' ? undefined : (output.activityLevel as UserProfile['activityLevel']),
    fitnessLevel:
      output.fitnessLevel === '' ? undefined : (output.fitnessLevel as UserProfile['fitnessLevel']),
    measurementSystem: output.measurementSystem,
  };
}

function formatHeightForForm(heightInches: number | undefined, system: MeasurementSystem): string {
  if (heightInches === undefined) {
    return '';
  }

  if (system === 'metric') {
    return String(Math.round(inchesToCm(heightInches) * 10) / 10);
  }

  return String(Math.round(heightInches * 10) / 10);
}

function formatWeightForForm(weightLbs: number | undefined, system: MeasurementSystem): string {
  if (weightLbs === undefined) {
    return '';
  }

  if (system === 'metric') {
    return String(Math.round(lbsToKg(weightLbs) * 10) / 10);
  }

  return String(Math.round(weightLbs * 10) / 10);
}

function parseHeightFromForm(
  value: number | undefined,
  system: MeasurementSystem
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (system === 'metric') {
    return Math.round(cmToInches(value) * 10) / 10;
  }

  return value;
}

function parseWeightFromForm(
  value: number | undefined,
  system: MeasurementSystem
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (system === 'metric') {
    return Math.round(kgToLbs(value) * 10) / 10;
  }

  return value;
}

export { emptyUserProfileFormValues };
