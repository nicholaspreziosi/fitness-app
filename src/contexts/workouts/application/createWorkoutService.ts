import { WorkoutService } from '@/src/contexts/workouts/application/workout.service';
import { createFirestoreExerciseRepository } from '@/src/contexts/exercises/infrastructure/firestoreExercise.repository';
import { createFirestoreTemplateBlockRepository } from '@/src/contexts/templateBlocks/infrastructure/firestoreTemplateBlock.repository';
import { createFirestoreWorkoutRepository } from '@/src/contexts/workouts/infrastructure/firestoreWorkout.repository';
import { getFirestoreDb } from '@/src/lib/firebase/app';

export function createWorkoutService(userId: string): WorkoutService {
  const db = getFirestoreDb();

  if (!db) {
    throw new Error('Firestore is not configured.');
  }

  return new WorkoutService(
    createFirestoreWorkoutRepository(userId, db),
    createFirestoreTemplateBlockRepository(userId, db),
    createFirestoreExerciseRepository(userId, db)
  );
}
