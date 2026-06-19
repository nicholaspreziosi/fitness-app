import { Text } from '@/components/ui/text';
import { TemplateBlockForm } from '@/src/ui/templateBlocks/components/TemplateBlockForm';
import { useTemplateBlockFormActions } from '@/src/ui/templateBlocks/hooks/useTemplateBlockFormActions';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { useRouter } from 'expo-router';

export function TemplateBlockCreateView() {
  const router = useRouter();
  const { createTemplateBlock, isSaving, error } = useTemplateBlockFormActions();
  const { exercises, isLoading } = useExerciseLibrary();

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingState message="Loading exercises..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        title="New Template"
        description="Group exercises into a reusable workout building block."
      />

      {error ? (
        <Text className="mb-4 text-sm text-destructive">Unable to save template block.</Text>
      ) : null}

      <TemplateBlockForm
        exercises={exercises}
        mode="create"
        onSubmit={async (values) => {
          await createTemplateBlock(values);
          router.replace('/library');
        }}
      />

      {isSaving ? (
        <Text className="mt-4 text-sm text-muted-foreground">Saving template block...</Text>
      ) : null}
    </ScreenContainer>
  );
}
