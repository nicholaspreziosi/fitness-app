import { createExerciseService } from '@/src/contexts/exercises/application/createExerciseService';
import { formOutputToExerciseFields } from '@/src/contexts/exercises/domain/exerciseForm.mapper';
import type { ExerciseFormOutput } from '@/src/contexts/exercises/domain/exerciseForm.schema';
import { createId } from '@/src/lib/id/createId';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function requireUserId(userId: string | undefined): asserts userId is string {
  if (!userId) {
    throw new Error('You must be signed in to save exercises.');
  }
}

export function useExerciseFormActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const invalidateExercises = () => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: exerciseQueryKeys(userId).all,
    });
  };

  const invalidateExerciseDetail = (exerciseId: string) => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: exerciseQueryKeys(userId).detail(exerciseId),
    });
  };

  const createMutation = useMutation({
    mutationFn: async (values: ExerciseFormOutput) => {
      requireUserId(userId);
      const service = createExerciseService(userId);
      await service.createExercise({
        id: createId('exercise'),
        favorite: false,
        ...formOutputToExerciseFields(values),
      });
    },
    onSuccess: invalidateExercises,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ExerciseFormOutput }) => {
      requireUserId(userId);
      const service = createExerciseService(userId);
      const existing = await service.getExercise(id);
      await service.updateExercise({
        ...existing,
        ...formOutputToExerciseFields(values),
      });
    },
    onSuccess: (_data, variables) => {
      invalidateExercises();
      invalidateExerciseDetail(variables.id);
    },
  });

  return {
    createExercise: createMutation.mutateAsync,
    updateExercise: (id: string, values: ExerciseFormOutput) =>
      updateMutation.mutateAsync({ id, values }),
    isSaving: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error ?? updateMutation.error,
  };
}
