import { createTemplateBlockService } from '@/src/contexts/templateBlocks/application/createTemplateBlockService';
import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { templateBlockQueryKeys } from '@/src/ui/templateBlocks/hooks/templateBlockQueryKeys';
import { useToggleTemplateBlockFavorite } from '@/src/ui/templateBlocks/hooks/useToggleTemplateBlockFavorite';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const TEMPLATE_BLOCK_LIST_STALE_TIME_MS = 60_000;

function useRefreshTemplateBlocks(userId: string | undefined) {
  const queryClient = useQueryClient();

  return async () => {
    if (!userId) {
      return;
    }

    await Promise.all([
      queryClient.refetchQueries({ queryKey: templateBlockQueryKeys(userId).all }),
      queryClient.refetchQueries({ queryKey: exerciseQueryKeys(userId).usedIds }),
    ]);
  };
}

export function useTemplateBlocks(options?: { enabled?: boolean }) {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const refreshTemplateBlocks = useRefreshTemplateBlocks(userId);
  const keys = templateBlockQueryKeys(userId ?? '');
  const enabled = options?.enabled ?? true;

  const templateBlocksQuery = useQuery({
    queryKey: keys.all,
    enabled: Boolean(userId) && enabled,
    staleTime: TEMPLATE_BLOCK_LIST_STALE_TIME_MS,
    retry: false,
    queryFn: async () => {
      const service = createTemplateBlockService(userId!);
      return service.listTemplateBlocks();
    },
  });

  const isInitialLoading =
    templateBlocksQuery.isLoading && templateBlocksQuery.data === undefined;

  const archiveMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const service = createTemplateBlockService(userId!);
      await service.archiveTemplateBlock(blockId);
    },
    onSuccess: async (_, blockId) => {
      queryClient.setQueryData<TemplateBlock[]>(keys.all, (current) =>
        current?.map((block) =>
          block.id === blockId ? { ...block, status: 'archived' } : block
        ) ?? []
      );
      await refreshTemplateBlocks();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const service = createTemplateBlockService(userId!);
      await service.restoreTemplateBlock(blockId);
    },
    onSuccess: async (_, blockId) => {
      queryClient.setQueryData<TemplateBlock[]>(keys.all, (current) =>
        current?.map((block) =>
          block.id === blockId ? { ...block, status: 'active' } : block
        ) ?? []
      );
      await refreshTemplateBlocks();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const service = createTemplateBlockService(userId!);
      await service.deleteTemplateBlock(blockId);
    },
    onSuccess: async (_, blockId) => {
      queryClient.setQueryData<TemplateBlock[]>(keys.all, (current) =>
        current?.filter((block) => block.id !== blockId) ?? []
      );
      queryClient.removeQueries({ queryKey: keys.detail(blockId) });
      await refreshTemplateBlocks();
    },
  });

  const { toggleFavorite } = useToggleTemplateBlockFavorite();

  return {
    templateBlocks: templateBlocksQuery.data ?? [],
    isLoading: isInitialLoading,
    isRefreshing: templateBlocksQuery.isRefetching,
    error: templateBlocksQuery.error,
    refetch: templateBlocksQuery.refetch,
    archiveTemplateBlock: archiveMutation.mutateAsync,
    restoreTemplateBlock: restoreMutation.mutateAsync,
    deleteTemplateBlock: deleteMutation.mutateAsync,
    toggleFavorite,
  };
}
