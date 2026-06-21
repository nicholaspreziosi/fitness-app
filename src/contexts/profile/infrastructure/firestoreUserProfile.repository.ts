import type { UserProfile, UserProfileUpdate } from '@/src/contexts/profile/domain/userProfile.model';
import type { UserProfileRepository } from '@/src/contexts/profile/domain/userProfile.repository';
import {
  userProfileFromFirestore,
  userProfileToFirestore,
  userProfileUpdateToFirestore,
  type FirestoreUserProfileDocument,
} from '@/src/contexts/profile/infrastructure/userProfile.mapper';
import { requireUserId } from '@/src/contexts/shared/domain/repository.errors';
import { runFirestoreRequest } from '@/src/contexts/shared/infrastructure/firestore.request';
import { doc, collection, getDoc, setDoc, updateDoc, type Firestore } from 'firebase/firestore';

export class FirestoreUserProfileRepository implements UserProfileRepository {
  private readonly userId: string;

  constructor(
    userId: string,
    private readonly db: Firestore
  ) {
    requireUserId(userId);
    this.userId = userId;
  }

  private getDocRef() {
    return doc(collection(this.db, 'users'), this.userId);
  }

  async findById(id: string): Promise<UserProfile | null> {
    return runFirestoreRequest('loading profile', async () => {
      const docRef = this.getDocRef();
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return userProfileFromFirestore(
        id,
        snapshot.data() as FirestoreUserProfileDocument
      );
    });
  }

  async create(profile: UserProfile): Promise<void> {
    await runFirestoreRequest('creating profile', async () => {
      const docRef = this.getDocRef();
      await setDoc(docRef, userProfileToFirestore(profile));
    });
  }

  async update(id: string, update: UserProfileUpdate): Promise<void> {
    await runFirestoreRequest('updating profile', async () => {
      const docRef = this.getDocRef();
      await updateDoc(
        docRef,
        userProfileUpdateToFirestore({
          ...update,
          updatedAt: new Date(),
        })
      );
    });
  }
}

export function createFirestoreUserProfileRepository(
  userId: string,
  db: Firestore
): FirestoreUserProfileRepository {
  return new FirestoreUserProfileRepository(userId, db);
}
