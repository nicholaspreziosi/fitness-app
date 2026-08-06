import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

export function useExerciseHistory(exerciseId: string) {
  const { user } = useAuth();
  const userId = user?.id;

  const historyQuery = useQuery({
    queryKey: exerciseQueryKeys(userId ?? '').history(exerciseId),
    enabled: Boolean(userId && exerciseId),
    queryFn: async () => {
      const service = createWorkoutService(userId!);
      return service.getExercisePerformanceHistory(exerciseId);
    },
  });

  return {
    history: historyQuery.data,
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
  };
}
