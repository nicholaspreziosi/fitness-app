import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout, WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import {
  captureWorkoutListCaches,
  moveWorkoutExerciseInCaches,
  reorderWorkoutInCaches,
  restoreWorkoutListCaches,
  type WorkoutListCacheSnapshot,
} from '@/src/ui/workouts/hooks/workoutCacheHelpers';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type WorkoutListMutationContext = {
  previousCaches?: WorkoutListCacheSnapshot;
};

function useInvalidateWeeklyWorkouts(userId: string | undefined) {
  const queryClient = useQueryClient();

  return () => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: ['workouts', userId],
    });
  };
}

export function useWorkoutMutations() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWeeklyWorkouts(userId);

  const createWorkout = useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      date: Date;
      status?: 'draft' | 'planned' | 'completed' | 'skipped';
      templateBlockIds?: string[];
      exerciseIds?: string[];
    }) => {
      const service = createWorkoutService(userId!);
      return service.createWorkout(params);
    },
    onSuccess: invalidate,
  });

  const addTemplateBlock = useMutation({
    mutationFn: async (params: { workoutId: string; templateBlockId: string }) => {
      const service = createWorkoutService(userId!);
      return service.addTemplateBlockToWorkout(params.workoutId, params.templateBlockId);
    },
    onSuccess: invalidate,
  });

  const addTemplateBlocks = useMutation({
    mutationFn: async (params: { workoutId: string; templateBlockIds: string[] }) => {
      const service = createWorkoutService(userId!);
      return service.addTemplateBlocksToWorkout(params.workoutId, params.templateBlockIds);
    },
    onSuccess: invalidate,
  });

  const addExercise = useMutation({
    mutationFn: async (params: { workoutId: string; exerciseId: string }) => {
      const service = createWorkoutService(userId!);
      return service.addExerciseToWorkout(params.workoutId, params.exerciseId);
    },
    onSuccess: invalidate,
  });

  const addExercises = useMutation({
    mutationFn: async (params: { workoutId: string; exerciseIds: string[] }) => {
      const service = createWorkoutService(userId!);
      return service.addExercisesToWorkout(params.workoutId, params.exerciseIds);
    },
    onSuccess: invalidate,
  });

  const removeExercise = useMutation({
    mutationFn: async (params: { workoutId: string; workoutExerciseId: string }) => {
      const service = createWorkoutService(userId!);
      return service.removeExerciseFromWorkout(params.workoutId, params.workoutExerciseId);
    },
    onSuccess: invalidate,
  });

  const reorderExercises = useMutation({
    mutationFn: async (params: { workoutId: string; orderedIds: string[] }) => {
      const service = createWorkoutService(userId!);
      return service.reorderWorkoutExercises(params.workoutId, params.orderedIds);
    },
    onMutate: async (params) => {
      if (!userId) {
        return {} satisfies WorkoutListMutationContext;
      }

      await queryClient.cancelQueries({ queryKey: workoutQueryKeys(userId).all });

      const previousCaches = captureWorkoutListCaches(queryClient, userId);
      reorderWorkoutInCaches(queryClient, userId, params.workoutId, params.orderedIds);

      return { previousCaches } satisfies WorkoutListMutationContext;
    },
    onError: (_error, _params, context) => {
      if (context?.previousCaches) {
        restoreWorkoutListCaches(queryClient, context.previousCaches);
      }
    },
    onSettled: invalidate,
  });

  const moveExercise = useMutation({
    mutationFn: async (params: {
      sourceWorkoutId: string;
      workoutExerciseId: string;
      targetWorkoutId: string;
    }) => {
      const service = createWorkoutService(userId!);
      return service.moveExerciseToWorkout(
        params.sourceWorkoutId,
        params.workoutExerciseId,
        params.targetWorkoutId
      );
    },
    onMutate: async (params) => {
      if (!userId) {
        return {} satisfies WorkoutListMutationContext;
      }

      await queryClient.cancelQueries({ queryKey: workoutQueryKeys(userId).all });

      const previousCaches = captureWorkoutListCaches(queryClient, userId);
      moveWorkoutExerciseInCaches(queryClient, userId, params);

      return { previousCaches } satisfies WorkoutListMutationContext;
    },
    onError: (_error, _params, context) => {
      if (context?.previousCaches) {
        restoreWorkoutListCaches(queryClient, context.previousCaches);
      }
    },
    onSettled: invalidate,
  });

  const moveWorkout = useMutation({
    mutationFn: async (params: { workoutId: string; date: Date; confirmed?: boolean }) => {
      const service = createWorkoutService(userId!);
      return service.moveWorkoutToDate(params.workoutId, params.date, {
        confirmed: params.confirmed,
      });
    },
    onSuccess: invalidate,
  });

  const duplicateWorkout = useMutation({
    mutationFn: async (params: { workoutId: string; targetDate: Date }) => {
      const service = createWorkoutService(userId!);
      return service.duplicateWorkout(params.workoutId, params.targetDate);
    },
    onSuccess: invalidate,
  });

  const deleteWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const service = createWorkoutService(userId!);
      return service.deleteWorkout(workoutId);
    },
    onSuccess: invalidate,
  });

  const revertWorkoutToPlanned = useMutation({
    mutationFn: async (workoutId: string) => {
      const service = createWorkoutService(userId!);
      return service.revertWorkoutToPlanned(workoutId);
    },
    onSuccess: invalidate,
  });

  const startWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const service = createWorkoutService(userId!);
      return service.startWorkout(workoutId);
    },
    onSuccess: invalidate,
  });

  const skipWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const service = createWorkoutService(userId!);
      return service.skipWorkout(workoutId);
    },
    onSuccess: invalidate,
  });

  const resumeWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const service = createWorkoutService(userId!);
      return service.resumeWorkout(workoutId);
    },
    onSuccess: invalidate,
  });

  const completeWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const service = createWorkoutService(userId!);
      return service.completeWorkout(workoutId);
    },
    onSuccess: invalidate,
  });

  const exitWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const service = createWorkoutService(userId!);
      return service.exitWorkout(workoutId);
    },
    onSuccess: invalidate,
  });

  const updateWorkoutExercise = useMutation({
    mutationFn: async (params: {
      workoutId: string;
      workoutExerciseId: string;
      patch: Partial<
        Pick<
          WorkoutExercise,
          | 'completed'
          | 'actualSets'
          | 'actualReps'
          | 'actualHoldSeconds'
          | 'actualWeight'
          | 'notes'
        >
      >;
    }) => {
      const service = createWorkoutService(userId!);
      return service.updateWorkoutExercise(
        params.workoutId,
        params.workoutExerciseId,
        params.patch
      );
    },
    onSuccess: invalidate,
  });

  const updateWorkout = useMutation({
    mutationFn: async (workout: Workout) => {
      const service = createWorkoutService(userId!);
      return service.updateWorkout(workout);
    },
    onSuccess: invalidate,
  });

  const isPending =
    createWorkout.isPending ||
    addTemplateBlock.isPending ||
    addExercise.isPending ||
    removeExercise.isPending ||
    reorderExercises.isPending ||
    moveExercise.isPending ||
    moveWorkout.isPending ||
    duplicateWorkout.isPending ||
    deleteWorkout.isPending ||
    revertWorkoutToPlanned.isPending ||
    startWorkout.isPending ||
    resumeWorkout.isPending ||
    completeWorkout.isPending ||
    exitWorkout.isPending ||
    skipWorkout.isPending ||
    updateWorkoutExercise.isPending ||
    updateWorkout.isPending;

  return {
    createWorkout,
    addTemplateBlock,
    addTemplateBlocks,
    addExercise,
    addExercises,
    removeExercise,
    reorderExercises,
    moveExercise,
    moveWorkout,
    duplicateWorkout,
    deleteWorkout,
    revertWorkoutToPlanned,
    startWorkout,
    resumeWorkout,
    completeWorkout,
    exitWorkout,
    skipWorkout,
    updateWorkoutExercise,
    updateWorkout,
    isReady: Boolean(userId),
    isPending,
  };
}
