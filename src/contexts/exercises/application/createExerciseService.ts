import { ExerciseService } from '@/src/contexts/exercises/application/exercise.service';
import type { ExerciseUsageChecker } from '@/src/contexts/exercises/application/exercise.service';
import { createExerciseUsageChecker } from '@/src/contexts/exercises/application/createExerciseUsageChecker';
import { createFirestoreExerciseRepository } from '@/src/contexts/exercises/infrastructure/firestoreExercise.repository';
import { getFirestoreDb } from '@/src/lib/firebase/app';

export function createExerciseService(userId: string): ExerciseService {
  const db = getFirestoreDb();

  if (!db) {
    throw new Error('Firestore is not configured.');
  }

  let usageChecker: ExerciseUsageChecker | undefined;

  const getUsageChecker = (): ExerciseUsageChecker => {
    if (!usageChecker) {
      usageChecker = createExerciseUsageChecker(userId, db);
    }

    return usageChecker;
  };

  return new ExerciseService(createFirestoreExerciseRepository(userId, db), (exerciseId) =>
    getUsageChecker()(exerciseId)
  );
}
