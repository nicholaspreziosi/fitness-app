import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { mergeVisibleExerciseReorder } from '@/src/contexts/workouts/domain/workoutExerciseOrdering';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { WorkoutExerciseReorderList } from '@/src/ui/workouts/components/workoutModeDnD';
import { WorkoutProgressCard } from '@/src/ui/workouts/components/WorkoutProgressCard';
import * as React from 'react';
import { View } from 'react-native';

type WorkoutExercisePatch = Partial<
  Pick<
    WorkoutExercise,
    'completed' | 'actualSets' | 'actualReps' | 'actualHoldSeconds' | 'actualWeight' | 'notes'
  >
>;

type WorkoutModeViewProps = {
  workout: Workout;
  exerciseNames: Record<string, string>;
  saveError?: string | null;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  onExit: () => void;
  onFinish: () => void;
  onSkip: () => void;
  onExerciseChange: (workoutExerciseId: string, patch: WorkoutExercisePatch) => void;
  onReorderExercises: (orderedIds: string[]) => void;
};

export function WorkoutModeView({
  workout,
  exerciseNames,
  saveError,
  saveStatus = 'idle',
  onExit,
  onFinish,
  onSkip,
  onExerciseChange,
  onReorderExercises,
}: WorkoutModeViewProps) {
  const [showCompleted, setShowCompleted] = React.useState(false);

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

  return (
    <ScreenContainer>
      <PageHeader
        title={workout.name}
        description="Focused workout session"
        rightAction={
          <Button variant="outline" onPress={onExit}>
            <Text>Exit Workout</Text>
          </Button>
        }
      />

      <View className="mb-4 flex-row items-center gap-2">
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

      <View className="gap-4">
        <WorkoutProgressCard workout={workout} />

        <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
          <Label nativeID="show-completed-exercises">Show completed exercises</Label>
          <Switch
            accessibilityLabel="Show completed exercises"
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
            nativeID="show-completed-exercises"
          />
        </View>

        <WorkoutExerciseReorderList
          exercises={visibleExercises}
          exerciseNames={exerciseNames}
          onReorder={handleReorder}
          onExerciseChange={onExerciseChange}
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
  );
}
