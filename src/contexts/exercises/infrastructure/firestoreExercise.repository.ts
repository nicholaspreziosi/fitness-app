import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import {
  exerciseFromFirestore,
  exerciseToFirestore,
} from '@/src/contexts/exercises/infrastructure/exercise.mapper';
import { RepositoryError, requireUserId } from '@/src/contexts/shared/domain/repository.errors';
import { runFirestoreRequest } from '@/src/contexts/shared/infrastructure/firestore.request';
import { userCollectionPath } from '@/src/lib/firebase/paths';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';

export class FirestoreExerciseRepository implements ExerciseRepository {
  private readonly collectionPath: string;

  constructor(
    userId: string,
    private readonly db: Firestore
  ) {
    requireUserId(userId);
    this.collectionPath = userCollectionPath(userId, 'exercises');
  }

  async create(exercise: Exercise): Promise<void> {
    await runFirestoreRequest('saving exercise', async () => {
      const docRef = doc(collection(this.db, this.collectionPath), exercise.id);
      await setDoc(docRef, exerciseToFirestore(exercise));
    });
  }

  async update(exercise: Exercise): Promise<void> {
    await runFirestoreRequest('updating exercise', async () => {
      const docRef = doc(collection(this.db, this.collectionPath), exercise.id);
      await setDoc(docRef, exerciseToFirestore(exercise), { merge: true });
    });
  }

  async findById(id: string): Promise<Exercise | null> {
    return runFirestoreRequest('loading exercise', async () => {
      const docRef = doc(collection(this.db, this.collectionPath), id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return exerciseFromFirestore(
        snapshot.id,
        snapshot.data() as ReturnType<typeof exerciseToFirestore>
      );
    });
  }

  async listAll(): Promise<Exercise[]> {
    return runFirestoreRequest('loading exercises', async () => {
      const snapshot = await getDocs(collection(this.db, this.collectionPath));

      return snapshot.docs.map((document) =>
        exerciseFromFirestore(
          document.id,
          document.data() as ReturnType<typeof exerciseToFirestore>
        )
      );
    });
  }

  async listActive(): Promise<Exercise[]> {
    return this.listByStatus('active');
  }

  async listArchived(): Promise<Exercise[]> {
    return this.listByStatus('archived');
  }

  async archive(id: string): Promise<void> {
    await this.updateStatus(id, 'archived');
  }

  async restore(id: string): Promise<void> {
    await this.updateStatus(id, 'active');
  }

  async setFavorite(id: string, favorite: boolean): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), id);
    await updateDoc(docRef, { favorite });
  }

  async hardDelete(id: string): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), id);
    await deleteDoc(docRef);
  }

  async listByStatus(status: Exercise['status']): Promise<Exercise[]> {
    return runFirestoreRequest('loading exercises', async () => {
      const snapshot = await getDocs(
        query(collection(this.db, this.collectionPath), where('status', '==', status))
      );

      return snapshot.docs.map((document) =>
        exerciseFromFirestore(
          document.id,
          document.data() as ReturnType<typeof exerciseToFirestore>
        )
      );
    });
  }

  private async updateStatus(id: string, status: Exercise['status']): Promise<void> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new RepositoryError('Exercise not found.', 'not_found');
    }

    await this.update({
      ...existing,
      status,
      updatedAt: new Date(),
    });
  }
}

export function createFirestoreExerciseRepository(
  userId: string,
  db: Firestore
): ExerciseRepository {
  return new FirestoreExerciseRepository(userId, db);
}
