import { Text } from '@/components/ui/text';
import { exerciseToFormValues } from '@/src/contexts/exercises/domain/exerciseForm.mapper';
import { ExerciseForm } from '@/src/ui/exercises/components/ExerciseForm';
import { useExercise } from '@/src/ui/exercises/hooks/useExercise';
import { useExerciseFormActions } from '@/src/ui/exercises/hooks/useExerciseFormActions';
import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DumbbellIcon } from 'lucide-react-native';

export function ExerciseEditView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = id ?? '';
  const { exercise, isLoading, error } = useExercise(exerciseId);
  const { updateExercise, isSaving, error: saveError } = useExerciseFormActions();

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingState message="Loading exercise..." />
      </ScreenContainer>
    );
  }

  if (error || !exercise) {
    return (
      <ScreenContainer scrollable={false}>
        <EmptyState
          icon={DumbbellIcon}
          title="Exercise not found"
          description="This exercise may have been deleted."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader title="Edit Exercise" description={exercise.name} />

      {saveError ? (
        <Text className="mb-4 text-sm text-destructive">Unable to save exercise.</Text>
      ) : null}

      <ExerciseForm
        mode="edit"
        initialValues={exerciseToFormValues(exercise)}
        onSubmit={async (values) => {
          await updateExercise(exercise.id, values);
          router.replace('/library');
        }}
      />

      {isSaving ? (
        <Text className="mt-4 text-sm text-muted-foreground">Saving exercise...</Text>
      ) : null}
    </ScreenContainer>
  );
}
