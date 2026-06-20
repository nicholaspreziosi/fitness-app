import { Icon } from '@/components/ui/icon';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { SwipeableListRow } from '@/src/ui/shared/components/SwipeableListRow';
import { PlannedExerciseRow } from '@/src/ui/workouts/components/PlannedExerciseRow';
import { GripVerticalIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

type ExerciseReorderListProps = {
  exercises: WorkoutExercise[];
  exercisesById: Map<string, Exercise>;
  onReorder: (orderedIds: string[]) => void;
  onRemoveExercise: (workoutExerciseId: string) => void;
};

export function ExerciseReorderList({
  exercises,
  exercisesById,
  onReorder,
  onRemoveExercise,
}: ExerciseReorderListProps) {
  return (
    <View className="gap-1">
      <DraggableFlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        containerStyle={{ gap: 4 }}
        activationDistance={8}
        scrollEnabled={false}
        onDragEnd={({ data }) => onReorder(data.map((item) => item.id))}
        renderItem={({ item, drag, isActive }) => (
          <SwipeableListRow
            actions={[
              {
                label: 'Delete',
                destructive: true,
                testID: `delete-exercise-${item.id}`,
                onPress: () => onRemoveExercise(item.id),
              },
            ]}
            className="bg-transparent px-0 py-0">
            <PlannedExerciseRow
              workoutExercise={item}
              exerciseName={exercisesById.get(item.exerciseId)?.name ?? 'Unknown exercise'}
              showDragHandle
              dragHandleRight
              className={isActive ? 'opacity-90' : undefined}
              dragHandle={
                <Pressable
                  accessibilityRole="button"
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
        )}
      />
    </View>
  );
}
