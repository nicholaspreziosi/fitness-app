import { Icon } from '@/components/ui/icon';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { WorkoutExerciseCard } from '@/src/ui/workouts/components/WorkoutExerciseCard';
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
};

export function WorkoutExerciseReorderList({
  exercises,
  exerciseNames,
  onReorder,
  onExerciseChange,
}: WorkoutExerciseReorderListProps) {
  return (
    <DraggableFlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      activationDistance={8}
      scrollEnabled={false}
      onDragEnd={({ data }) => onReorder(data.map((item) => item.id))}
      renderItem={({ item, drag, isActive }) => (
        <View className="mb-4">
          <WorkoutExerciseCard
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
        </View>
      )}
    />
  );
}
