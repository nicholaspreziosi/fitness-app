import { Text } from '@/components/ui/text';
import { templateBlockToFormValues } from '@/src/contexts/templateBlocks/domain/templateBlockForm.mapper';
import { TemplateBlockForm } from '@/src/ui/templateBlocks/components/TemplateBlockForm';
import { useTemplateBlock } from '@/src/ui/templateBlocks/hooks/useTemplateBlock';
import { useTemplateBlockFormActions } from '@/src/ui/templateBlocks/hooks/useTemplateBlockFormActions';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LayersIcon } from 'lucide-react-native';

export function TemplateBlockEditView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const blockId = id ?? '';
  const { templateBlock, isLoading: blockLoading, error } = useTemplateBlock(blockId);
  const { exercises, isLoading: exercisesLoading } = useExerciseLibrary();
  const { updateTemplateBlock, isSaving, error: saveError } = useTemplateBlockFormActions();

  if (blockLoading || exercisesLoading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (error || !templateBlock) {
    return (
      <ScreenContainer scrollable={false}>
        <EmptyState
          icon={LayersIcon}
          title="Template block not found"
          description="This template block may have been deleted."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader title="Edit Template" description={templateBlock.name} />

      {saveError ? (
        <Text className="mb-4 text-sm text-destructive">Unable to save template block.</Text>
      ) : null}

      <TemplateBlockForm
        exercises={exercises}
        mode="edit"
        initialValues={templateBlockToFormValues(templateBlock)}
        onSubmit={async (values) => {
          await updateTemplateBlock(blockId, values);
          router.replace(`/library/template-blocks/${blockId}`);
        }}
      />

      {isSaving ? (
        <Text className="mt-4 text-sm text-muted-foreground">Saving template block...</Text>
      ) : null}
    </ScreenContainer>
  );
}
