import { createExerciseService } from '@/src/contexts/exercises/application/createExerciseService';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import {
  EXERCISE_LIST_STALE_TIME_MS,
} from '@/src/ui/exercises/hooks/usePrefetchExerciseLibrary';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useToggleExerciseFavorite } from '@/src/ui/exercises/hooks/useToggleExerciseFavorite';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function useRefreshExerciseLibrary(userId: string | undefined) {
  const queryClient = useQueryClient();

  return async () => {
    if (!userId) {
      return;
    }

    const keys = exerciseQueryKeys(userId);

    await Promise.all([
      queryClient.refetchQueries({ queryKey: keys.all }),
      queryClient.refetchQueries({ queryKey: keys.usedIds }),
    ]);
  };
}

export function useExerciseLibrary() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const refreshExerciseLibrary = useRefreshExerciseLibrary(userId);
  const keys = exerciseQueryKeys(userId ?? '');

  const exercisesQuery = useQuery({
    queryKey: keys.all,
    enabled: Boolean(userId),
    staleTime: EXERCISE_LIST_STALE_TIME_MS,
    retry: false,
    queryFn: async () => {
      const service = createExerciseService(userId!);
      return service.listExercises();
    },
  });

  const usedExerciseIdsQuery = useQuery({
    queryKey: keys.usedIds,
    enabled: Boolean(userId),
    staleTime: EXERCISE_LIST_STALE_TIME_MS,
    retry: false,
    queryFn: async () => {
      const service = createExerciseService(userId!);
      return service.listUsedExerciseIds();
    },
  });

  const isInitialLoading = exercisesQuery.isLoading && exercisesQuery.data === undefined;

  const archiveMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const service = createExerciseService(userId!);
      await service.archiveExercise(exerciseId);
    },
    onSuccess: async (_, exerciseId) => {
      queryClient.setQueryData<Exercise[]>(keys.all, (current) =>
        current?.map((exercise) =>
          exercise.id === exerciseId ? { ...exercise, status: 'archived' } : exercise
        ) ?? []
      );
      await refreshExerciseLibrary();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const service = createExerciseService(userId!);
      await service.restoreExercise(exerciseId);
    },
    onSuccess: async (_, exerciseId) => {
      queryClient.setQueryData<Exercise[]>(keys.all, (current) =>
        current?.map((exercise) =>
          exercise.id === exerciseId ? { ...exercise, status: 'active' } : exercise
        ) ?? []
      );
      await refreshExerciseLibrary();
    },
  });

  const { toggleFavorite } = useToggleExerciseFavorite();

  const deleteMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const service = createExerciseService(userId!);
      await service.deleteExercise(exerciseId);
    },
    onSuccess: async (_, exerciseId) => {
      queryClient.setQueryData<Exercise[]>(keys.all, (current) =>
        current?.filter((exercise) => exercise.id !== exerciseId) ?? []
      );
      queryClient.removeQueries({ queryKey: keys.detail(exerciseId) });
      await refreshExerciseLibrary();
    },
  });

  return {
    exercises: exercisesQuery.data ?? [],
    usedExerciseIds: usedExerciseIdsQuery.data ?? new Set<string>(),
    isLoading: isInitialLoading,
    isRefreshing: exercisesQuery.isRefetching,
    error: exercisesQuery.error,
    refetch: exercisesQuery.refetch,
    archiveExercise: archiveMutation.mutateAsync,
    restoreExercise: restoreMutation.mutateAsync,
    toggleFavorite,
    deleteExercise: deleteMutation.mutateAsync,
  };
}
