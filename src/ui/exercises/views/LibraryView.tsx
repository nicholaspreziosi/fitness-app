import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { filterExercises } from '@/src/contexts/exercises/domain/exercise.filters';
import type { ExerciseListFilters } from '@/src/contexts/exercises/domain/exercise.filters';
import { filterTemplateBlocks } from '@/src/contexts/templateBlocks/domain/templateBlock.filters';
import type { TemplateBlockListFilters } from '@/src/contexts/templateBlocks/domain/templateBlock.filters';
import { ExerciseFiltersPanel } from '@/src/ui/exercises/components/ExerciseFiltersPanel';
import { ExerciseListItem } from '@/src/ui/exercises/components/ExerciseListItem';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { DividedList } from '@/src/ui/shared/components/DividedList';
import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { SectionHeader } from '@/src/ui/shared/components/SectionHeader';
import { SegmentedControl } from '@/src/ui/shared/components/SegmentedControl';
import { TemplateBlockFiltersPanel } from '@/src/ui/templateBlocks/components/TemplateBlockFiltersPanel';
import { TemplateBlockListItem } from '@/src/ui/templateBlocks/components/TemplateBlockListItem';
import { useTemplateBlocks } from '@/src/ui/templateBlocks/hooks/useTemplateBlocks';
import { useRouter } from 'expo-router';
import { DumbbellIcon, LayersIcon, PlusIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

type LibraryTab = 'exercises' | 'templates';

export function LibraryView() {
  const router = useRouter();
  const [tab, setTab] = React.useState<LibraryTab>('exercises');
  const [search, setSearch] = React.useState('');
  const [exerciseFilters, setExerciseFilters] = React.useState<ExerciseListFilters>({
    status: 'all',
    favoritesOnly: false,
  });
  const [templateFilters, setTemplateFilters] = React.useState<TemplateBlockListFilters>({
    status: 'all',
    favoritesOnly: false,
  });

  const {
    exercises,
    isLoading: exercisesLoading,
    isRefreshing: exercisesRefreshing,
    error: exercisesError,
    archiveExercise,
    restoreExercise,
    deleteExercise,
  } = useExerciseLibrary();

  const {
    templateBlocks,
    isLoading: templatesLoading,
    isRefreshing: templatesRefreshing,
    error: templatesError,
    archiveTemplateBlock,
    restoreTemplateBlock,
  } = useTemplateBlocks({ enabled: tab === 'templates' });

  const filteredExercises = React.useMemo(
    () => filterExercises(exercises, { ...exerciseFilters, search }),
    [exercises, exerciseFilters, search]
  );

  const filteredTemplateBlocks = React.useMemo(
    () => filterTemplateBlocks(templateBlocks, { ...templateFilters, search }),
    [templateBlocks, templateFilters, search]
  );

  const openCreateExercise = () => {
    router.push('/library/exercises/new');
  };

  const openCreateTemplate = () => {
    router.push('/library/template-blocks/new');
  };

  const openEditExercise = (exerciseId: string) => {
    router.push(`/library/exercises/${exerciseId}`);
  };

  const openEditTemplate = (blockId: string) => {
    router.push(`/library/template-blocks/${blockId}`);
  };

  const isExercisesTab = tab === 'exercises';
  const isLoading = isExercisesTab ? exercisesLoading : templatesLoading;
  const isRefreshing = isExercisesTab ? exercisesRefreshing : templatesRefreshing;
  const error = isExercisesTab ? exercisesError : templatesError;

  if (isLoading) {
    return (
      <ScreenContainer>
        <PageHeader title="Library" />
        <LoadingState message={isExercisesTab ? 'Loading exercises...' : 'Loading templates...'} />
      </ScreenContainer>
    );
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : 'Check your connection and try again.';

    return (
      <ScreenContainer>
        <PageHeader title="Library" />
        <EmptyState
          icon={isExercisesTab ? DumbbellIcon : LayersIcon}
          title={isExercisesTab ? 'Unable to load exercises' : 'Unable to load templates'}
          description={message}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader title="Library" />

      <View className="gap-4">
        <SegmentedControl
          testID="library-segmented-control"
          value={tab}
          options={[
            { label: 'Exercises', value: 'exercises' },
            { label: 'Templates', value: 'templates' },
          ]}
          onChange={setTab}
        />

        <Input
          className="h-9"
          placeholder={isExercisesTab ? 'Search exercises...' : 'Search templates...'}
          testID="library-search"
          value={search}
          onChangeText={setSearch}
        />

        {isExercisesTab ? (
          <ExerciseFiltersPanel filters={exerciseFilters} onChange={setExerciseFilters} />
        ) : (
          <TemplateBlockFiltersPanel filters={templateFilters} onChange={setTemplateFilters} />
        )}

        <View className="gap-3">
          <SectionHeader
            title={isExercisesTab ? 'Exercises' : 'Templates'}
            description={
              Platform.OS === 'web'
                ? 'Tap to open. Right-click for more actions.'
                : 'Tap to open. Swipe left or long-press for more actions.'
            }
            action={
              isExercisesTab ? (
                <View className="flex-row items-center gap-2">
                  {isRefreshing ? <ActivityIndicator size="small" /> : null}
                  <FlowButton icon={PlusIcon} label="Create" onPress={openCreateExercise} />
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  {isRefreshing ? <ActivityIndicator size="small" /> : null}
                  <FlowButton icon={PlusIcon} label="Create" onPress={openCreateTemplate} />
                </View>
              )
            }
          />

          {isExercisesTab ? (
            exercises.length === 0 ? (
              <EmptyState
                icon={DumbbellIcon}
                title="No exercises yet"
                description="Create your first exercise to start building workouts."
              />
            ) : filteredExercises.length === 0 ? (
              <EmptyState
                icon={DumbbellIcon}
                title="No matching exercises"
                description="Try adjusting your search or filters."
              />
            ) : (
              <DividedList>
                {filteredExercises.map((exercise) => (
                  <ExerciseListItem
                    key={exercise.id}
                    exercise={exercise}
                    onArchive={archiveExercise}
                    onDelete={deleteExercise}
                    onPress={() => openEditExercise(exercise.id)}
                    onRestore={restoreExercise}
                  />
                ))}
              </DividedList>
            )
          ) : templateBlocks.length === 0 ? (
            <EmptyState
              icon={LayersIcon}
              title="No templates yet"
              description="Template blocks group exercises into reusable workout building blocks."
            />
          ) : filteredTemplateBlocks.length === 0 ? (
            <EmptyState
              icon={LayersIcon}
              title="No matching templates"
              description="Try adjusting your search or filters."
            />
          ) : (
            <DividedList>
              {filteredTemplateBlocks.map((block) => (
                <TemplateBlockListItem
                  key={block.id}
                  block={block}
                  onArchive={archiveTemplateBlock}
                  onPress={() => openEditTemplate(block.id)}
                  onRestore={restoreTemplateBlock}
                />
              ))}
            </DividedList>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
