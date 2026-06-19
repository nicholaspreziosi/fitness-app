import { Text } from '@/components/ui/text';
import { ExerciseForm } from '@/src/ui/exercises/components/ExerciseForm';
import { useExerciseFormActions } from '@/src/ui/exercises/hooks/useExerciseFormActions';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { useRouter } from 'expo-router';

export function ExerciseCreateView() {
  const router = useRouter();
  const { createExercise, isSaving, error } = useExerciseFormActions();

  return (
    <ScreenContainer>
      <PageHeader
        title="New Exercise"
        description="Add an exercise to your master library."
      />

      {error ? (
        <Text className="mb-4 text-sm text-destructive">Unable to save exercise.</Text>
      ) : null}

      <ExerciseForm
        mode="create"
        onSubmit={async (values) => {
          await createExercise(values);
          router.replace('/library');
        }}
      />

      {isSaving ? (
        <Text className="mt-4 text-sm text-muted-foreground">Saving exercise...</Text>
      ) : null}
    </ScreenContainer>
  );
}
