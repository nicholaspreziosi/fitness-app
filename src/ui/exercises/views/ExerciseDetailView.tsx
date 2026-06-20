import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { formatExercisePrescription } from '@/src/contexts/exercises/domain/exercisePresentation';
import { useExercise } from '@/src/ui/exercises/hooks/useExercise';
import { useToggleExerciseFavorite } from '@/src/ui/exercises/hooks/useToggleExerciseFavorite';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { DetailField } from '@/src/ui/shared/components/DetailField';
import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { FavoriteButton } from '@/src/ui/shared/components/FavoriteButton';
import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DumbbellIcon, PencilIcon } from 'lucide-react-native';
import { View } from 'react-native';

function formatList(items?: string[]): string | undefined {
  if (!items?.length) {
    return undefined;
  }

  return items.join(', ');
}

function BadgeList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View className="mt-2 flex-row flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="outline">
          <Text>{item}</Text>
        </Badge>
      ))}
    </View>
  );
}

export function ExerciseDetailView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = id ?? '';
  const { exercise, isLoading, error } = useExercise(exerciseId);
  const { toggleFavorite } = useToggleExerciseFavorite();

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

  const prescription = formatExercisePrescription(exercise);
  const primaryMuscles = [
    ...(exercise.primaryMuscles ?? []),
    ...(exercise.otherPrimaryMuscles ?? []),
  ];
  const secondaryMuscles = [
    ...(exercise.secondaryMuscles ?? []),
    ...(exercise.otherSecondaryMuscles ?? []),
  ];
  const equipment = [...(exercise.equipment ?? []), ...(exercise.otherEquipment ?? [])];

  return (
    <ScreenContainer>
      <PageHeader
        title={exercise.name}
        description={prescription ?? 'No default prescription set'}
      />

      <View className="mb-6 flex-row flex-wrap items-center gap-2">
        {exercise.status !== 'active' ? (
          <Badge variant={exercise.status === 'archived' ? 'outline' : 'muted'}>
            <Text>{exercise.status.charAt(0).toUpperCase() + exercise.status.slice(1)}</Text>
          </Badge>
        ) : null}
        <FavoriteButton
          favorite={exercise.favorite ?? false}
          testID="favorite-exercise-button"
          onPress={() => toggleFavorite(exercise.id, exercise.favorite ?? false)}
        />
        <FlowButton
          icon={PencilIcon}
          label="Edit"
          size="sm"
          testID="edit-exercise-button"
          variant="outline"
          onPress={() => router.push(`/library/exercises/${exercise.id}/edit`)}
        />
      </View>

      <ComponentDemoSection title="Defaults">
        <DetailField label="Prescription" value={prescription ?? 'Not set'} />
      </ComponentDemoSection>

      <ComponentDemoSection title="Classification">
        <DetailField label="Body part" value={exercise.bodyPart} />
        <DetailField label="Primary muscles">
          {primaryMuscles.length > 0 ? <BadgeList items={primaryMuscles} /> : null}
        </DetailField>
        <DetailField label="Secondary muscles">
          {secondaryMuscles.length > 0 ? <BadgeList items={secondaryMuscles} /> : null}
        </DetailField>
        <DetailField label="Type" value={formatList(exercise.type)} />
        <DetailField label="Purpose" value={formatList(exercise.purpose)} />
        <DetailField label="Equipment" value={formatList(equipment)} />
      </ComponentDemoSection>

      {exercise.notes ? (
        <ComponentDemoSection title="Notes">
          <DetailField label="Notes" value={exercise.notes} />
        </ComponentDemoSection>
      ) : null}
    </ScreenContainer>
  );
}
