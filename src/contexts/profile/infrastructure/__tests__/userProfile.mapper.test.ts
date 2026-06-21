import {
  userProfileFromFirestore,
  userProfileToFirestore,
} from '../userProfile.mapper';
import type { UserProfile } from '@/src/contexts/profile/domain/userProfile.model';
import { Timestamp } from 'firebase/firestore';

describe('userProfile.mapper', () => {
  const profile: UserProfile = {
    id: 'user-1',
    accountStatus: 'active',
    firstName: 'Nick',
    fitnessLevel: 'advanced',
    measurementSystem: 'imperial',
    weekStartDay: 0,
    createdAt: new Date('2025-01-01T12:00:00.000Z'),
    updatedAt: new Date('2025-01-02T12:00:00.000Z'),
  };

  it('round-trips profile through firestore document', () => {
    const firestoreDoc = userProfileToFirestore(profile);
    const restored = userProfileFromFirestore('user-1', {
      ...firestoreDoc,
      createdAt: Timestamp.fromDate(profile.createdAt),
      updatedAt: Timestamp.fromDate(profile.updatedAt),
    });

    expect(restored).toEqual(profile);
  });
});
