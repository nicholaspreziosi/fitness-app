import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { canMoveExerciseBetweenWorkouts } from '@/src/contexts/workouts/domain/planner.rules';
import type { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';

export type ExerciseDragPayload = {
  sourceWorkoutId: string;
  workoutExerciseId: string;
  exerciseId: string;
};

export type PlannerDropHandlerParams = {
  workouts: Workout[];
  mutations: ReturnType<typeof useWorkoutMutations>;
  onBlocked: (message: string) => void;
};

export function createPlannerDropHandler({
  workouts,
  mutations,
  onBlocked,
}: PlannerDropHandlerParams) {
  const findWorkout = (workoutId: string) => workouts.find((workout) => workout.id === workoutId);

  const handleCrossWorkoutDrop = async (
    payload: ExerciseDragPayload,
    targetWorkoutId: string
  ) => {
    if (payload.sourceWorkoutId === targetWorkoutId) {
      return;
    }

    const source = findWorkout(payload.sourceWorkoutId);
    const target = findWorkout(targetWorkoutId);

    if (!source || !target) {
      return;
    }

    const rule = canMoveExerciseBetweenWorkouts(source, target, payload.exerciseId);

    if (!rule.allowed) {
      onBlocked(rule.message);
      return;
    }

    await mutations.moveExercise.mutateAsync({
      sourceWorkoutId: payload.sourceWorkoutId,
      workoutExerciseId: payload.workoutExerciseId,
      targetWorkoutId,
    });
  };

  const handleReorder = async (workoutId: string, orderedIds: string[]) => {
    await mutations.reorderExercises.mutateAsync({ workoutId, orderedIds });
  };

  return {
    handleCrossWorkoutDrop,
    handleReorder,
  };
}
