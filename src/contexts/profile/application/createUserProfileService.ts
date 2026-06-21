import { UserProfileService } from '@/src/contexts/profile/application/userProfile.service';
import { createFirestoreUserProfileRepository } from '@/src/contexts/profile/infrastructure/firestoreUserProfile.repository';
import { getFirestoreDb } from '@/src/lib/firebase/app';

export function createUserProfileService(userId: string): UserProfileService {
  const db = getFirestoreDb();

  if (!db) {
    throw new Error('Firestore is not configured.');
  }

  return new UserProfileService(createFirestoreUserProfileRepository(userId, db));
}
