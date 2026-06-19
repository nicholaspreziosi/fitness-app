import { createTemplateBlockService } from '@/src/contexts/templateBlocks/application/createTemplateBlockService';
import { templateBlockQueryKeys } from '@/src/ui/templateBlocks/hooks/templateBlockQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const TEMPLATE_BLOCK_LIST_STALE_TIME_MS = 60_000;

function useInvalidateTemplateBlocks(userId: string | undefined) {
  const queryClient = useQueryClient();

  return () => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: templateBlockQueryKeys(userId).all,
    });
  };
}

export function useTemplateBlocks(options?: { enabled?: boolean }) {
  const { user } = useAuth();
  const userId = user?.id;
  const invalidateTemplateBlocks = useInvalidateTemplateBlocks(userId);
  const enabled = options?.enabled ?? true;

  const templateBlocksQuery = useQuery({
    queryKey: templateBlockQueryKeys(userId ?? '').all,
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
    onSuccess: invalidateTemplateBlocks,
  });

  const restoreMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const service = createTemplateBlockService(userId!);
      await service.restoreTemplateBlock(blockId);
    },
    onSuccess: invalidateTemplateBlocks,
  });

  return {
    templateBlocks: templateBlocksQuery.data ?? [],
    isLoading: isInitialLoading,
    isRefreshing: templateBlocksQuery.isFetching && templateBlocksQuery.data !== undefined,
    error: templateBlocksQuery.error,
    archiveTemplateBlock: archiveMutation.mutateAsync,
    restoreTemplateBlock: restoreMutation.mutateAsync,
  };
}
