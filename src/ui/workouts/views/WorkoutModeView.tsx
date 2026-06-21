import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { mergeVisibleExerciseReorder } from '@/src/contexts/workouts/domain/workoutExerciseOrdering';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { PopoverMenu } from '@/src/ui/shared/components/PopoverMenu';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { useRefreshGuard } from '@/src/ui/shared/providers/RefreshGuardProvider';
import { useUiPreferences } from '@/src/ui/shared/hooks/useUiPreferences';
import { ExercisePickerSheet } from '@/src/ui/workouts/components/ExercisePickerSheet';
import { TemplateBlockPickerSheet } from '@/src/ui/workouts/components/TemplateBlockPickerSheet';
import { WorkoutExerciseReorderList } from '@/src/ui/workouts/components/workoutModeDnD';
import { WorkoutProgressCard } from '@/src/ui/workouts/components/WorkoutProgressCard';
import { ChevronDownIcon, PlusIcon } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';

type WorkoutExercisePatch = Partial<
  Pick<
    WorkoutExercise,
    'completed' | 'actualSets' | 'actualReps' | 'actualHoldSeconds' | 'actualWeight' | 'notes'
  >
>;

type WorkoutModeSheet = 'none' | 'addExercise' | 'addTemplate';

type WorkoutModeViewProps = {
  workout: Workout;
  exerciseNames: Record<string, string>;
  saveError?: string | null;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  isRefreshing?: boolean;
  onRefresh?: () => Promise<unknown>;
  onExit: () => void;
  onFinish: () => void;
  onSkip: () => void;
  onExerciseChange: (workoutExerciseId: string, patch: WorkoutExercisePatch) => void;
  onReorderExercises: (orderedIds: string[]) => void;
  onRemoveExercise: (workoutExerciseId: string) => void;
};

export function WorkoutModeView({
  workout,
  exerciseNames,
  saveError,
  saveStatus = 'idle',
  isRefreshing = false,
  onRefresh,
  onExit,
  onFinish,
  onSkip,
  onExerciseChange,
  onReorderExercises,
  onRemoveExercise,
}: WorkoutModeViewProps) {
  const { preferences, setPreference } = useUiPreferences();
  const { isDragging, isInputFocused } = useRefreshGuard();
  const showCompleted = preferences.showCompletedExercises;
  const isSubmitting = saveStatus === 'saving';
  const refreshEnabled = !isDragging && !isSubmitting && !isInputFocused;
  const [activeSheet, setActiveSheet] = React.useState<WorkoutModeSheet>('none');

  const visibleExercises = workout.exercises.filter(
    (exercise) => showCompleted || !exercise.completed
  );

  const handleReorder = React.useCallback(
    (reorderedVisibleIds: string[]) => {
      const visibleIds = visibleExercises.map((exercise) => exercise.id);
      const orderedIds = mergeVisibleExerciseReorder(
        workout.exercises,
        visibleIds,
        reorderedVisibleIds
      );
      onReorderExercises(orderedIds);
    },
    [onReorderExercises, visibleExercises, workout.exercises]
  );

  const addMenuItems = React.useMemo(
    () => [
      {
        label: 'Exercises',
        testID: 'workout-mode-add-exercises',
        onPress: () => setActiveSheet('addExercise'),
      },
      {
        label: 'Templates',
        testID: 'workout-mode-add-templates',
        onPress: () => setActiveSheet('addTemplate'),
      },
    ],
    []
  );

  const closeSheet = React.useCallback(() => {
    setActiveSheet('none');
  }, []);

  const renderSheet = () => {
    switch (activeSheet) {
      case 'addExercise':
        return <ExercisePickerSheet workout={workout} onClose={closeSheet} />;
      case 'addTemplate':
        return <TemplateBlockPickerSheet workout={workout} onClose={closeSheet} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ScreenContainer
        refreshing={isRefreshing}
        refreshEnabled={refreshEnabled && activeSheet === 'none'}
        onRefresh={onRefresh}>
        <PageHeader
          title={workout.name}
          description="Focused workout session"
          rightAction={
            <Button variant="outline" onPress={onExit}>
              <Text>Exit Workout</Text>
            </Button>
          }
        />

        <View className="mb-4 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-2">
            <Badge variant="default">
              <Text>In Progress</Text>
            </Badge>
            {saveStatus === 'saving' ? (
              <Text className="text-xs text-muted-foreground">Saving…</Text>
            ) : null}
            {saveStatus === 'saved' ? (
              <Text className="text-xs text-muted-foreground">Saved</Text>
            ) : null}
            {saveStatus === 'error' && saveError ? (
              <Text className="text-xs text-destructive">{saveError}</Text>
            ) : null}
          </View>
          <PopoverMenu
            items={addMenuItems}
            accessibilityLabel="Add exercises or templates"
            menuAlign="end"
            trigger={
              <Button variant="outline" size="sm" testID="workout-mode-add">
                <Icon as={PlusIcon} className="size-3.5 text-foreground" />
                <Text>Add</Text>
                <Icon as={ChevronDownIcon} className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
        </View>

        <View className="gap-4">
          <WorkoutProgressCard workout={workout} />

          <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
            <Label nativeID="show-completed-exercises">Show completed exercises</Label>
            <Switch
              accessibilityLabel="Show completed exercises"
              checked={showCompleted}
              onCheckedChange={(value) => void setPreference('showCompletedExercises', value)}
              nativeID="show-completed-exercises"
            />
          </View>

          <WorkoutExerciseReorderList
            exercises={visibleExercises}
            exerciseNames={exerciseNames}
            onReorder={handleReorder}
            onExerciseChange={onExerciseChange}
            onRemoveExercise={onRemoveExercise}
          />

          <View className="gap-2 pb-4">
            <Button onPress={onFinish}>
              <Text>Finish Workout</Text>
            </Button>
            <Button variant="outline" onPress={onSkip}>
              <Text>Skip Workout</Text>
            </Button>
          </View>
        </View>
      </ScreenContainer>

      <Modal
        visible={activeSheet !== 'none'}
        transparent
        animationType="none"
        onRequestClose={closeSheet}>
        <View className="flex-1">
          <Pressable className="absolute inset-0 bg-black/40" onPress={closeSheet} />
          <View className="flex-1 justify-end" pointerEvents="box-none">
            <Pressable onPress={(event) => event.stopPropagation()}>{renderSheet()}</Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
