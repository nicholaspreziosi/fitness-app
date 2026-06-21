import { createExerciseService } from '@/src/contexts/exercises/application/createExerciseService';
import {
  EXERCISE_LIST_STALE_TIME_MS,
} from '@/src/ui/exercises/hooks/usePrefetchExerciseLibrary';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useToggleExerciseFavorite } from '@/src/ui/exercises/hooks/useToggleExerciseFavorite';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function useInvalidateExercises(userId: string | undefined) {
  const queryClient = useQueryClient();

  return () => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: exerciseQueryKeys(userId).all,
    });
  };
}

export function useExerciseLibrary() {
  const { user } = useAuth();
  const userId = user?.id;
  const invalidateExercises = useInvalidateExercises(userId);

  const exercisesQuery = useQuery({
    queryKey: exerciseQueryKeys(userId ?? '').all,
    enabled: Boolean(userId),
    staleTime: EXERCISE_LIST_STALE_TIME_MS,
    retry: false,
    queryFn: async () => {
      const service = createExerciseService(userId!);
      return service.listExercises();
    },
  });

  const isInitialLoading = exercisesQuery.isLoading && exercisesQuery.data === undefined;

  const archiveMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const service = createExerciseService(userId!);
      await service.archiveExercise(exerciseId);
    },
    onSuccess: invalidateExercises,
  });

  const restoreMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const service = createExerciseService(userId!);
      await service.restoreExercise(exerciseId);
    },
    onSuccess: invalidateExercises,
  });

  const { toggleFavorite } = useToggleExerciseFavorite();

  const deleteMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const service = createExerciseService(userId!);
      await service.deleteExercise(exerciseId);
    },
    onSuccess: invalidateExercises,
  });

  return {
    exercises: exercisesQuery.data ?? [],
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
