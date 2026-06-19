import { createTemplateBlockService } from '@/src/contexts/templateBlocks/application/createTemplateBlockService';
import { templateBlockQueryKeys } from '@/src/ui/templateBlocks/hooks/templateBlockQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

export function useTemplateBlock(blockId: string) {
  const { user } = useAuth();
  const userId = user?.id;

  const templateBlockQuery = useQuery({
    queryKey: templateBlockQueryKeys(userId ?? '').detail(blockId),
    enabled: Boolean(userId && blockId),
    queryFn: async () => {
      const service = createTemplateBlockService(userId!);
      return service.getTemplateBlock(blockId);
    },
  });

  return {
    templateBlock: templateBlockQuery.data,
    isLoading: templateBlockQuery.isLoading,
    error: templateBlockQuery.error,
  };
}
