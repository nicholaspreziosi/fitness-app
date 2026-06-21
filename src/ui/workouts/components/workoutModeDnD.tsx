import { Icon } from '@/components/ui/icon';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { SwipeableListRow } from '@/src/ui/shared/components/SwipeableListRow';
import { WorkoutExerciseCard } from '@/src/ui/workouts/components/WorkoutExerciseCard';
import { useOptionalRefreshGuard } from '@/src/ui/shared/providers/RefreshGuardProvider';
import { GripVerticalIcon } from 'lucide-react-native';
import * as React from 'react';
import { LogBox, Pressable, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing',
]);

type WorkoutExercisePatch = Partial<
  Pick<
    WorkoutExercise,
    'completed' | 'actualSets' | 'actualReps' | 'actualHoldSeconds' | 'actualWeight' | 'notes'
  >
>;

type WorkoutExerciseReorderListProps = {
  exercises: WorkoutExercise[];
  exerciseNames: Record<string, string>;
  onReorder: (orderedIds: string[]) => void;
  onExerciseChange: (workoutExerciseId: string, patch: WorkoutExercisePatch) => void;
  onRemoveExercise: (workoutExerciseId: string) => void;
};

export function WorkoutExerciseReorderList({
  exercises,
  exerciseNames,
  onReorder,
  onExerciseChange,
  onRemoveExercise,
}: WorkoutExerciseReorderListProps) {
  const refreshGuard = useOptionalRefreshGuard();

  return (
    <DraggableFlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      activationDistance={8}
      scrollEnabled={false}
      onDragBegin={() => refreshGuard?.setDragging(true)}
      onDragEnd={({ data }) => {
        refreshGuard?.setDragging(false);
        onReorder(data.map((item) => item.id));
      }}
      renderItem={({ item, drag, isActive }) => (
        <View className="mb-4">
          <SwipeableListRow
            contained
            containerClassName={item.completed ? 'border-success/20' : undefined}
            actions={[
              {
                label: 'Delete',
                destructive: true,
                testID: `delete-exercise-${item.id}`,
                onPress: () => onRemoveExercise(item.id),
              },
            ]}
            className="bg-card">
            <WorkoutExerciseCard
              embedded
              exercise={item}
              exerciseName={exerciseNames[item.exerciseId] ?? 'Exercise'}
              showDragHandle
              dragHandleRight
              className={isActive ? 'opacity-90' : undefined}
              onChange={(patch) => onExerciseChange(item.id, patch)}
              dragHandle={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reorder exercise"
                  hitSlop={8}
                  delayLongPress={200}
                  onLongPress={drag}>
                  <View className="px-1 py-2">
                    <Icon as={GripVerticalIcon} className="size-4 text-muted-foreground" />
                  </View>
                </Pressable>
              }
            />
          </SwipeableListRow>
        </View>
      )}
    />
  );
}
