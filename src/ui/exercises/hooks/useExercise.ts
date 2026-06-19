import { createExerciseService } from '@/src/contexts/exercises/application/createExerciseService';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

export function useExercise(exerciseId: string) {
  const { user } = useAuth();
  const userId = user?.id;

  const exerciseQuery = useQuery({
    queryKey: exerciseQueryKeys(userId ?? '').detail(exerciseId),
    enabled: Boolean(userId && exerciseId),
    queryFn: async () => {
      const service = createExerciseService(userId!);
      return service.getExercise(exerciseId);
    },
  });

  return {
    exercise: exerciseQuery.data,
    isLoading: exerciseQuery.isLoading,
    error: exerciseQuery.error,
  };
}
