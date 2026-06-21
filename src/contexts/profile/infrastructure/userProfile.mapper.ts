import type { UserProfile, UserProfileUpdate } from '@/src/contexts/profile/domain/userProfile.model';
import {
  dateToTimestamp,
  stripUndefinedFields,
  timestampToDate,
} from '@/src/contexts/shared/infrastructure/firestore.mapper';
import type { Timestamp } from 'firebase/firestore';

export type FirestoreUserProfileDocument = {
  accountStatus: UserProfile['accountStatus'];
  firstName?: string;
  lastName?: string;
  phone?: string;
  language?: string;
  country?: string;
  timeZone?: string;
  weekStartDay?: UserProfile['weekStartDay'];
  gender?: UserProfile['gender'];
  heightInches?: number;
  weightLbs?: number;
  activityLevel?: UserProfile['activityLevel'];
  fitnessLevel?: UserProfile['fitnessLevel'];
  measurementSystem?: UserProfile['measurementSystem'];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export function userProfileToFirestore(profile: UserProfile): FirestoreUserProfileDocument {
  return stripUndefinedFields({
    accountStatus: profile.accountStatus,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    language: profile.language,
    country: profile.country,
    timeZone: profile.timeZone,
    weekStartDay: profile.weekStartDay,
    gender: profile.gender,
    heightInches: profile.heightInches,
    weightLbs: profile.weightLbs,
    activityLevel: profile.activityLevel,
    fitnessLevel: profile.fitnessLevel,
    measurementSystem: profile.measurementSystem,
    createdAt: dateToTimestamp(profile.createdAt),
    updatedAt: dateToTimestamp(profile.updatedAt),
  });
}

export function userProfileFromFirestore(
  id: string,
  data: FirestoreUserProfileDocument
): UserProfile {
  return {
    id,
    accountStatus: data.accountStatus,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    language: data.language,
    country: data.country,
    timeZone: data.timeZone,
    weekStartDay: data.weekStartDay,
    gender: data.gender,
    heightInches: data.heightInches,
    weightLbs: data.weightLbs,
    activityLevel: data.activityLevel,
    fitnessLevel: data.fitnessLevel,
    measurementSystem: data.measurementSystem,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export function userProfileUpdateToFirestore(
  update: UserProfileUpdate & { updatedAt: Date }
): Partial<FirestoreUserProfileDocument> {
  return stripUndefinedFields({
    accountStatus: update.accountStatus,
    firstName: update.firstName,
    lastName: update.lastName,
    phone: update.phone,
    language: update.language,
    country: update.country,
    timeZone: update.timeZone,
    weekStartDay: update.weekStartDay,
    gender: update.gender,
    heightInches: update.heightInches,
    weightLbs: update.weightLbs,
    activityLevel: update.activityLevel,
    fitnessLevel: update.fitnessLevel,
    measurementSystem: update.measurementSystem,
    updatedAt: dateToTimestamp(update.updatedAt),
  });
}
