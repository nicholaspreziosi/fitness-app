import { createTemplateBlockService } from '@/src/contexts/templateBlocks/application/createTemplateBlockService';
import { formOutputToTemplateBlockFields } from '@/src/contexts/templateBlocks/domain/templateBlockForm.mapper';
import type { TemplateBlockFormOutput } from '@/src/contexts/templateBlocks/domain/templateBlockForm.schema';
import { createId } from '@/src/lib/id/createId';
import { templateBlockQueryKeys } from '@/src/ui/templateBlocks/hooks/templateBlockQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function requireUserId(userId: string | undefined): asserts userId is string {
  if (!userId) {
    throw new Error('You must be signed in to save template blocks.');
  }
}

export function useTemplateBlockFormActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const invalidateTemplateBlocks = () => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: templateBlockQueryKeys(userId).all,
    });
  };

  const invalidateTemplateBlockDetail = (blockId: string) => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: templateBlockQueryKeys(userId).detail(blockId),
    });
  };

  const createMutation = useMutation({
    mutationFn: async (values: TemplateBlockFormOutput) => {
      requireUserId(userId);
      const service = createTemplateBlockService(userId);
      await service.createTemplateBlock({
        id: createId('template-block'),
        favorite: false,
        ...formOutputToTemplateBlockFields(values),
      });
    },
    onSuccess: invalidateTemplateBlocks,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TemplateBlockFormOutput }) => {
      requireUserId(userId);
      const service = createTemplateBlockService(userId);
      const existing = await service.getTemplateBlock(id);
      await service.updateTemplateBlock({
        ...existing,
        ...formOutputToTemplateBlockFields(values),
      });
    },
    onSuccess: (_data, variables) => {
      invalidateTemplateBlocks();
      invalidateTemplateBlockDetail(variables.id);
    },
  });

  return {
    createTemplateBlock: createMutation.mutateAsync,
    updateTemplateBlock: (id: string, values: TemplateBlockFormOutput) =>
      updateMutation.mutateAsync({ id, values }),
    isSaving: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error ?? updateMutation.error,
  };
}
