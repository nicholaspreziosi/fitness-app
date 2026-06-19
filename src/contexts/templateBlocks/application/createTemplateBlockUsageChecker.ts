import type { TemplateBlockUsageChecker } from '@/src/contexts/templateBlocks/application/templateBlock.service';
import { createFirestoreWorkoutRepository } from '@/src/contexts/workouts/infrastructure/firestoreWorkout.repository';
import type { Firestore } from 'firebase/firestore';

export function createTemplateBlockUsageChecker(
  userId: string,
  db: Firestore
): TemplateBlockUsageChecker {
  const workoutRepository = createFirestoreWorkoutRepository(userId, db);

  return async (templateBlockId: string) => {
    const workouts = await workoutRepository.listAll();

    return workouts.some((workout) =>
      workout.sourceTemplateBlockIds?.includes(templateBlockId)
    );
  };
}
