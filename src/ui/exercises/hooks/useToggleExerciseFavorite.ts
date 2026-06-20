import { createExerciseService } from '@/src/contexts/exercises/application/createExerciseService';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ToggleExerciseFavoriteInput = {
  id: string;
  isFavorite: boolean;
};

type ToggleExerciseFavoriteContext = {
  previousList?: Exercise[];
  previousDetail?: Exercise;
};

export function useToggleExerciseFavorite() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const keys = exerciseQueryKeys(userId ?? '');

  const mutation = useMutation({
    mutationFn: async ({ id, isFavorite }: ToggleExerciseFavoriteInput) => {
      const service = createExerciseService(userId!);

      if (isFavorite) {
        await service.unfavoriteExercise(id);
      } else {
        await service.favoriteExercise(id);
      }
    },
    onMutate: async ({ id, isFavorite }) => {
      if (!userId) {
        return {};
      }

      await queryClient.cancelQueries({ queryKey: keys.all });
      await queryClient.cancelQueries({ queryKey: keys.detail(id) });

      const previousList = queryClient.getQueryData<Exercise[]>(keys.all);
      const previousDetail = queryClient.getQueryData<Exercise>(keys.detail(id));
      const nextFavorite = !isFavorite;

      if (previousList) {
        queryClient.setQueryData<Exercise[]>(
          keys.all,
          previousList.map((exercise) =>
            exercise.id === id ? { ...exercise, favorite: nextFavorite } : exercise
          )
        );
      }

      if (previousDetail) {
        queryClient.setQueryData<Exercise>(keys.detail(id), {
          ...previousDetail,
          favorite: nextFavorite,
        });
      }

      return { previousList, previousDetail } satisfies ToggleExerciseFavoriteContext;
    },
    onError: (_error, { id }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(keys.all, context.previousList);
      }

      if (context?.previousDetail) {
        queryClient.setQueryData(keys.detail(id), context.previousDetail);
      }
    },
    onSettled: (_data, _error, { id }) => {
      if (!userId) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: keys.all });
      void queryClient.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });

  return {
    toggleFavorite: (id: string, isFavorite: boolean) =>
      mutation.mutate({ id, isFavorite }),
  };
}
