import { ExerciseService } from '@/src/contexts/exercises/application/exercise.service';
import { createExerciseUsageResolver } from '@/src/contexts/exercises/application/createExerciseUsageChecker';
import { createFirestoreExerciseRepository } from '@/src/contexts/exercises/infrastructure/firestoreExercise.repository';
import { getFirestoreDb } from '@/src/lib/firebase/app';

export function createExerciseService(userId: string): ExerciseService {
  const db = getFirestoreDb();

  if (!db) {
    throw new Error('Firestore is not configured.');
  }

  const usageResolver = createExerciseUsageResolver(userId, db);

  return new ExerciseService(
    createFirestoreExerciseRepository(userId, db),
    usageResolver.isExerciseUsed,
    usageResolver.loadUsedExerciseIds
  );
}
