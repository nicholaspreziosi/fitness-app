import { createExerciseService } from '@/src/contexts/exercises/application/createExerciseService';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

const EXERCISE_LIST_STALE_TIME_MS = 5 * 60 * 1000;

export function prefetchExerciseLibrary(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string
) {
  return queryClient.prefetchQuery({
    queryKey: exerciseQueryKeys(userId).all,
    staleTime: EXERCISE_LIST_STALE_TIME_MS,
    retry: false,
    queryFn: async () => {
      const service = createExerciseService(userId);
      return service.listExercises();
    },
  });
}

export function usePrefetchExerciseLibrary() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (loading || !user?.id) {
      return;
    }

    void prefetchExerciseLibrary(queryClient, user.id);
  }, [loading, queryClient, user?.id]);
}

export { EXERCISE_LIST_STALE_TIME_MS };
