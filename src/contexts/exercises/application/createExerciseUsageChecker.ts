import type {
  ExerciseUsageChecker,
  UsedExerciseIdsLoader,
} from '@/src/contexts/exercises/application/exercise.service';
import { collectUsedExerciseIds } from '@/src/contexts/exercises/domain/exercise.usage';
import { createFirestoreTemplateBlockRepository } from '@/src/contexts/templateBlocks/infrastructure/firestoreTemplateBlock.repository';
import { createFirestoreWorkoutRepository } from '@/src/contexts/workouts/infrastructure/firestoreWorkout.repository';
import type { Firestore } from 'firebase/firestore';

type ExerciseUsageResolver = {
  isExerciseUsed: ExerciseUsageChecker;
  loadUsedExerciseIds: UsedExerciseIdsLoader;
};

export function createExerciseUsageResolver(userId: string, db: Firestore): ExerciseUsageResolver {
  const templateBlockRepository = createFirestoreTemplateBlockRepository(userId, db);
  const workoutRepository = createFirestoreWorkoutRepository(userId, db);

  const loadUsedExerciseIds: UsedExerciseIdsLoader = async () => {
    const [templateBlocks, workouts] = await Promise.all([
      templateBlockRepository.listAll(),
      workoutRepository.listAll(),
    ]);

    return collectUsedExerciseIds({
      templateBlockExerciseIds: templateBlocks.map((block) => block.exerciseIds),
      workoutExerciseIds: workouts.flatMap((workout) =>
        workout.exercises.map((exercise) => exercise.exerciseId)
      ),
    });
  };

  return {
    loadUsedExerciseIds,
    isExerciseUsed: async (exerciseId: string) => {
      const usedExerciseIds = await loadUsedExerciseIds();
      return usedExerciseIds.has(exerciseId);
    },
  };
}
