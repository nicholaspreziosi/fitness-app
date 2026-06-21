import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { filterExercises } from '@/src/contexts/exercises/domain/exercise.filters';
import { isSelectableExercise } from '@/src/contexts/exercises/domain/exercise.rules';
import { formatExercisePrescription } from '@/src/contexts/exercises/domain/exercisePresentation';
import {
  canAddExercisesToWorkout,
  workoutContainsExerciseId,
} from '@/src/contexts/workouts/domain/planner.rules';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

type ExercisePickerSheetProps = {
  workout: Workout;
  onClose: () => void;
};

function getEmptyMessage(availableCount: number, search: string): string {
  if (availableCount === 0) {
    return 'All exercises are already in this workout.';
  }

  if (search.trim()) {
    return 'No exercises match your search.';
  }

  return 'No exercises available to add.';
}

export function ExercisePickerSheet({ workout, onClose }: ExercisePickerSheetProps) {
  const { exercises, isLoading } = useExerciseLibrary();
  const { addExercises } = useWorkoutMutations();
  const [search, setSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const availableExercises = React.useMemo(
    () =>
      exercises.filter(
        (exercise) =>
          isSelectableExercise(exercise) && !workoutContainsExerciseId(workout, exercise.id)
      ),
    [exercises, workout]
  );

  const filteredExercises = React.useMemo(
    () => filterExercises(availableExercises, { search }),
    [availableExercises, search]
  );

  const toggleSelection = (exerciseId: string) => {
    setErrorMessage(null);
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }

      return next;
    });
  };

  const handleAdd = async () => {
    const exerciseIds = [...selectedIds];
    const rule = canAddExercisesToWorkout(workout, exerciseIds);

    if (!rule.allowed) {
      setErrorMessage(rule.message);
      return;
    }

    await addExercises.mutateAsync({ workoutId: workout.id, exerciseIds });
    onClose();
  };

  const selectedCount = selectedIds.size;

  return (
    <View className="gap-3 rounded-t-2xl border border-border bg-card p-4">
      <View className="gap-1">
        <Text className="text-lg font-semibold text-foreground">Add Exercises</Text>
        <Text className="text-sm text-muted-foreground">Select one or more exercises to add.</Text>
      </View>
      {errorMessage ? <Text className="text-sm text-destructive">{errorMessage}</Text> : null}
      {isLoading ? (
        <Text className="text-sm text-muted-foreground">Loading exercises...</Text>
      ) : (
        <>
          <Input
            className="h-9"
            placeholder="Search exercises..."
            testID="exercise-picker-search"
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView className="max-h-72">
            {filteredExercises.length === 0 ? (
              <Text className="py-4 text-center text-sm text-muted-foreground">
                {getEmptyMessage(availableExercises.length, search)}
              </Text>
            ) : (
              <View className="gap-1">
                {filteredExercises.map((exercise) => {
                  const prescription = formatExercisePrescription(exercise);
                  const isSelected = selectedIds.has(exercise.id);

                  return (
                    <Pressable
                      key={exercise.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      testID={`exercise-picker-${exercise.id}`}
                      className={cn(
                        'flex-row items-center gap-3 rounded-lg border border-border px-3 py-3',
                        isSelected && 'border-primary bg-primary/5'
                      )}
                      onPress={() => toggleSelection(exercise.id)}>
                      <Checkbox checked={isSelected} pointerEvents="none" />
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm text-foreground">{exercise.name}</Text>
                        {prescription ? (
                          <Text className="mt-0.5 text-xs text-muted-foreground">
                            {prescription}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </>
      )}
      <View className="flex-row justify-end gap-2">
        <Button variant="outline" onPress={onClose}>
          <Text>Cancel</Text>
        </Button>
        <Button
          testID="add-selected-exercises"
          disabled={selectedCount === 0 || addExercises.isPending}
          onPress={handleAdd}>
          <Text>
            {addExercises.isPending
              ? 'Adding...'
              : selectedCount === 1
                ? 'Add 1 exercise'
                : `Add ${selectedCount} exercises`}
          </Text>
        </Button>
      </View>
    </View>
  );
}
