import type { ExerciseUsageChecker } from '@/src/contexts/exercises/application/exercise.service';
import { createFirestoreTemplateBlockRepository } from '@/src/contexts/templateBlocks/infrastructure/firestoreTemplateBlock.repository';
import { createFirestoreWorkoutRepository } from '@/src/contexts/workouts/infrastructure/firestoreWorkout.repository';
import type { Firestore } from 'firebase/firestore';

export function createExerciseUsageChecker(userId: string, db: Firestore): ExerciseUsageChecker {
  const templateBlockRepository = createFirestoreTemplateBlockRepository(userId, db);
  const workoutRepository = createFirestoreWorkoutRepository(userId, db);

  return async (exerciseId: string) => {
    const [templateBlocks, workouts] = await Promise.all([
      templateBlockRepository.listAll(),
      workoutRepository.listAll(),
    ]);

    if (templateBlocks.some((block) => block.exerciseIds.includes(exerciseId))) {
      return true;
    }

    return workouts.some((workout) =>
      workout.exercises.some((exercise) => exercise.exerciseId === exerciseId)
    );
  };
}
