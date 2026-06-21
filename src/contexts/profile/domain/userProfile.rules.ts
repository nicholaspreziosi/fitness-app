import type { DeviceDefaults } from '@/src/lib/device/defaults';
import type {
  MeasurementSystem,
  UserProfile,
  WeekStartDay,
} from './userProfile.model';

export function isAccountPaused(profile: UserProfile): boolean {
  return profile.accountStatus === 'paused';
}

export function canUseTrainingFeatures(profile: UserProfile): boolean {
  return profile.accountStatus === 'active';
}

export function inferMeasurementSystem(country?: string): MeasurementSystem {
  if (country === 'US' || country === 'LR' || country === 'MM') {
    return 'imperial';
  }

  return 'metric';
}

export function inferWeekStartDay(locale?: string): WeekStartDay {
  if (!locale) {
    return 0;
  }

  try {
    const localeObj = new Intl.Locale(locale);
    const region = localeObj.region;

    if (region === 'US' || region === 'CA' || region === 'JP' || region === 'IL') {
      return 0;
    }

    if (region === 'GB' || region === 'AU' || region === 'NZ') {
      return 1;
    }
  } catch {
    return 0;
  }

  return 0;
}

export function buildDefaultProfileFields(
  userId: string,
  deviceDefaults: DeviceDefaults,
  now: Date = new Date()
): UserProfile {
  const country = deviceDefaults.country;
  const measurementSystem = inferMeasurementSystem(country);

  return {
    id: userId,
    accountStatus: 'active',
    language: deviceDefaults.language,
    country,
    timeZone: deviceDefaults.timeZone,
    weekStartDay: inferWeekStartDay(deviceDefaults.language),
    measurementSystem,
    createdAt: now,
    updatedAt: now,
  };
}
