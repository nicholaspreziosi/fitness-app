import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import type { WorkoutRepository } from '@/src/contexts/workouts/domain/workout.repository';
import {
  workoutFromFirestore,
  workoutToFirestore,
} from '@/src/contexts/workouts/infrastructure/workout.mapper';
import { isVisibleInWeeklyPlanner } from '@/src/contexts/workouts/domain/workout.rules';
import { RepositoryError, requireUserId } from '@/src/contexts/shared/domain/repository.errors';
import { userCollectionPath } from '@/src/lib/firebase/paths';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export class FirestoreWorkoutRepository implements WorkoutRepository {
  private readonly collectionPath: string;

  constructor(
    userId: string,
    private readonly db: Firestore
  ) {
    requireUserId(userId);
    this.collectionPath = userCollectionPath(userId, 'workouts');
  }

  async create(workout: Workout): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), workout.id);
    await setDoc(docRef, workoutToFirestore(workout));
  }

  async update(workout: Workout): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), workout.id);
    await setDoc(docRef, workoutToFirestore(workout), { merge: true });
  }

  async findById(id: string): Promise<Workout | null> {
    const docRef = doc(collection(this.db, this.collectionPath), id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return workoutFromFirestore(snapshot.id, snapshot.data() as ReturnType<typeof workoutToFirestore>);
  }

  async listByWeek(weekStart: Date, weekEnd: Date): Promise<Workout[]> {
    return this.listByDateRange(weekStart, weekEnd);
  }

  async listByDateRange(rangeStart: Date, rangeEnd: Date): Promise<Workout[]> {
    const snapshot = await getDocs(
      query(
        collection(this.db, this.collectionPath),
        where('date', '>=', Timestamp.fromDate(rangeStart)),
        where('date', '<=', Timestamp.fromDate(rangeEnd))
      )
    );

    return snapshot.docs
      .map((document) =>
        workoutFromFirestore(document.id, document.data() as ReturnType<typeof workoutToFirestore>)
      )
      .filter(isVisibleInWeeklyPlanner);
  }

  async listDrafts(): Promise<Workout[]> {
    const snapshot = await getDocs(
      query(collection(this.db, this.collectionPath), where('status', '==', 'draft'))
    );

    return snapshot.docs.map((document) =>
      workoutFromFirestore(document.id, document.data() as ReturnType<typeof workoutToFirestore>)
    );
  }

  async listAll(): Promise<Workout[]> {
    const snapshot = await getDocs(collection(this.db, this.collectionPath));

    return snapshot.docs.map((document) =>
      workoutFromFirestore(document.id, document.data() as ReturnType<typeof workoutToFirestore>)
    );
  }

  async archive(id: string): Promise<void> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new RepositoryError('Workout not found.', 'not_found');
    }

    await this.update({
      ...existing,
      status: 'archived',
      updatedAt: new Date(),
    });
  }

  async hardDelete(id: string): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), id);
    await deleteDoc(docRef);
  }
}

export function createFirestoreWorkoutRepository(
  userId: string,
  db: Firestore
): WorkoutRepository {
  return new FirestoreWorkoutRepository(userId, db);
}
