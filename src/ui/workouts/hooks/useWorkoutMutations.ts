import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  const invalidate = useInvalidateWeeklyWorkouts(userId);

  const createWorkout = useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      date: Date;
      status?: 'draft' | 'planned';
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

  const addExercise = useMutation({
    mutationFn: async (params: { workoutId: string; exerciseId: string }) => {
      const service = createWorkoutService(userId!);
      return service.addExerciseToWorkout(params.workoutId, params.exerciseId);
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
    onSuccess: invalidate,
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
    onSuccess: invalidate,
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

  const archiveWorkout = useMutation({
    mutationFn: async (workoutId: string) => {
      const service = createWorkoutService(userId!);
      return service.archiveWorkout(workoutId);
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

  const updateWorkout = useMutation({
    mutationFn: async (workout: Workout) => {
      const service = createWorkoutService(userId!);
      return service.updateWorkout(workout);
    },
    onSuccess: invalidate,
  });

  return {
    createWorkout,
    addTemplateBlock,
    addExercise,
    removeExercise,
    reorderExercises,
    moveExercise,
    moveWorkout,
    duplicateWorkout,
    deleteWorkout,
    archiveWorkout,
    startWorkout,
    resumeWorkout,
    skipWorkout,
    updateWorkout,
    isReady: Boolean(userId),
  };
}
