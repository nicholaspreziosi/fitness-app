import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { formatExercisePrescription } from '@/src/contexts/exercises/domain/exercisePresentation';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { useTemplateBlock } from '@/src/ui/templateBlocks/hooks/useTemplateBlock';
import { useToggleTemplateBlockFavorite } from '@/src/ui/templateBlocks/hooks/useToggleTemplateBlockFavorite';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { DetailField } from '@/src/ui/shared/components/DetailField';
import { DividedList } from '@/src/ui/shared/components/DividedList';
import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { FavoriteButton } from '@/src/ui/shared/components/FavoriteButton';
import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { SwipeableListRow } from '@/src/ui/shared/components/SwipeableListRow';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LayersIcon, PencilIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

export function TemplateBlockDetailView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const blockId = id ?? '';
  const { templateBlock, isLoading: blockLoading, error } = useTemplateBlock(blockId);
  const { exercises, isLoading: exercisesLoading } = useExerciseLibrary();
  const { toggleFavorite } = useToggleTemplateBlockFavorite();

  const exerciseNames = React.useMemo(() => {
    if (!templateBlock) {
      return [];
    }

    const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

    return templateBlock.exerciseIds.map((exerciseId) => {
      const exercise = exerciseById.get(exerciseId);

      return {
        id: exerciseId,
        name: exercise?.name ?? 'Unknown exercise',
        prescription: exercise ? formatExercisePrescription(exercise) : undefined,
      };
    });
  }, [exercises, templateBlock]);

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
      <PageHeader
        title={templateBlock.name}
        description={`${templateBlock.exerciseIds.length} exercise${
          templateBlock.exerciseIds.length === 1 ? '' : 's'
        }`}
      />

      <View className="mb-6 flex-row flex-wrap items-center gap-2">
        {templateBlock.status !== 'active' ? (
          <Badge variant={templateBlock.status === 'archived' ? 'outline' : 'muted'}>
            <Text>
              {templateBlock.status.charAt(0).toUpperCase() + templateBlock.status.slice(1)}
            </Text>
          </Badge>
        ) : null}
        <FavoriteButton
          favorite={templateBlock.favorite ?? false}
          testID="favorite-template-button"
          onPress={() => toggleFavorite(templateBlock.id, templateBlock.favorite ?? false)}
        />
        <FlowButton
          icon={PencilIcon}
          label="Edit"
          size="sm"
          testID="edit-template-button"
          variant="outline"
          onPress={() => router.push(`/library/template-blocks/${templateBlock.id}/edit`)}
        />
      </View>

      <ComponentDemoSection title="Exercises">
        {exerciseNames.length === 0 ? (
          <DetailField label="Exercises" value="No exercises added yet" />
        ) : (
          <DividedList>
            {exerciseNames.map((exercise) => (
              <SwipeableListRow
                key={exercise.id}
                actions={[]}
                accessibilityLabel={exercise.name}
                testID={`template-exercise-row-${exercise.id}`}
                onPress={() => router.push(`/library/exercises/${exercise.id}`)}>
                <View className="min-w-0">
                  <Text className="text-sm font-medium text-foreground">{exercise.name}</Text>
                  {exercise.prescription ? (
                    <Text className="mt-0.5 text-xs text-muted-foreground">
                      {exercise.prescription}
                    </Text>
                  ) : null}
                </View>
              </SwipeableListRow>
            ))}
          </DividedList>
        )}
      </ComponentDemoSection>

      {templateBlock.notes ? (
        <ComponentDemoSection title="Notes">
          <DetailField label="Notes" value={templateBlock.notes} />
        </ComponentDemoSection>
      ) : null}
    </ScreenContainer>
  );
}
