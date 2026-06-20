import { createTemplateBlockService } from '@/src/contexts/templateBlocks/application/createTemplateBlockService';
import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import { templateBlockQueryKeys } from '@/src/ui/templateBlocks/hooks/templateBlockQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ToggleTemplateBlockFavoriteInput = {
  id: string;
  isFavorite: boolean;
};

type ToggleTemplateBlockFavoriteContext = {
  previousList?: TemplateBlock[];
  previousDetail?: TemplateBlock;
};

export function useToggleTemplateBlockFavorite() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const keys = templateBlockQueryKeys(userId ?? '');

  const mutation = useMutation({
    mutationFn: async ({ id, isFavorite }: ToggleTemplateBlockFavoriteInput) => {
      const service = createTemplateBlockService(userId!);

      if (isFavorite) {
        await service.unfavoriteTemplateBlock(id);
      } else {
        await service.favoriteTemplateBlock(id);
      }
    },
    onMutate: async ({ id, isFavorite }) => {
      if (!userId) {
        return {};
      }

      await queryClient.cancelQueries({ queryKey: keys.all });
      await queryClient.cancelQueries({ queryKey: keys.detail(id) });

      const previousList = queryClient.getQueryData<TemplateBlock[]>(keys.all);
      const previousDetail = queryClient.getQueryData<TemplateBlock>(keys.detail(id));
      const nextFavorite = !isFavorite;

      if (previousList) {
        queryClient.setQueryData<TemplateBlock[]>(
          keys.all,
          previousList.map((block) =>
            block.id === id ? { ...block, favorite: nextFavorite } : block
          )
        );
      }

      if (previousDetail) {
        queryClient.setQueryData<TemplateBlock>(keys.detail(id), {
          ...previousDetail,
          favorite: nextFavorite,
        });
      }

      return { previousList, previousDetail } satisfies ToggleTemplateBlockFavoriteContext;
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
