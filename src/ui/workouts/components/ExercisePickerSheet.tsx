import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import {
  countExercisePickerFilters,
  ExercisePickerBodyPartFilters,
  type ExercisePickerFilters,
} from '@/src/ui/workouts/components/ExercisePickerFiltersPanel';
import { useKeyboardInset } from '@/src/ui/shared/hooks/useKeyboardInset';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import * as React from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

type ExercisePickerSheetProps = {
  workout: Workout;
  onClose: () => void;
};

const EMPTY_PICKER_FILTERS: ExercisePickerFilters = {
  favoritesOnly: false,
  bodyParts: [],
};

const SHEET_CHROME_HEIGHT = 280;

function getEmptyMessage(
  availableCount: number,
  search: string,
  hasActiveFilters: boolean
): string {
  if (availableCount === 0) {
    return 'All exercises are already in this workout.';
  }

  if (search.trim() || hasActiveFilters) {
    return 'No exercises match your search or filters.';
  }

  return 'No exercises available to add.';
}

export function ExercisePickerSheet({ workout, onClose }: ExercisePickerSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const keyboardHeight = useKeyboardInset();
  const { exercises, isLoading } = useExerciseLibrary();
  const { addExercises } = useWorkoutMutations();
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<ExercisePickerFilters>(EMPTY_PICKER_FILTERS);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const activeFilterCount = countExercisePickerFilters(filters);

  const { sheetMaxHeight, listMaxHeight } = React.useMemo(() => {
    const availableHeight =
      keyboardHeight > 0 ? windowHeight - keyboardHeight : windowHeight;
    const maxSheetHeight = Math.round(Math.min(windowHeight * 0.85, availableHeight));
    const maxListHeight = Math.max(96, maxSheetHeight - SHEET_CHROME_HEIGHT);
    const defaultListHeight = Math.round(windowHeight * 0.48);

    return {
      sheetMaxHeight: maxSheetHeight,
      listMaxHeight: Math.min(defaultListHeight, maxListHeight),
    };
  }, [keyboardHeight, windowHeight]);

  const availableExercises = React.useMemo(
    () =>
      exercises.filter(
        (exercise) =>
          isSelectableExercise(exercise) && !workoutContainsExerciseId(workout, exercise.id)
      ),
    [exercises, workout]
  );

  const filteredExercises = React.useMemo(
    () => filterExercises(availableExercises, { search, ...filters }),
    [availableExercises, filters, search]
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
  const favoritesOnly = filters.favoritesOnly ?? false;

  return (
    <View
      className="gap-3 rounded-t-2xl border border-border bg-card p-4"
      style={{ maxHeight: sheetMaxHeight }}>
      <View className="gap-1">
        <Text className="text-lg font-semibold text-foreground">Add Exercises</Text>
        <Text className="text-sm text-muted-foreground">Select one or more exercises to add.</Text>
      </View>
      {errorMessage ? <Text className="text-sm text-destructive">{errorMessage}</Text> : null}
      {isLoading ? (
        <Text className="text-sm text-muted-foreground">Loading exercises...</Text>
      ) : (
        <>
          <View className="flex-row items-center gap-3">
            <Input
              className="h-9 min-w-0 flex-1"
              placeholder="Search exercises..."
              testID="exercise-picker-search"
              value={search}
              onChangeText={setSearch}
            />
            <View className="shrink-0 flex-row items-center gap-2">
              <Text className="text-xs text-muted-foreground">Favorites</Text>
              <Switch
                accessibilityLabel="Favorites only"
                checked={favoritesOnly}
                testID="exercise-picker-favorites-switch"
                onCheckedChange={(value) =>
                  setFilters((current) => ({ ...current, favoritesOnly: Boolean(value) }))
                }
              />
            </View>
          </View>
          <ExercisePickerBodyPartFilters filters={filters} onChange={setFilters} />
          <ScrollView
            style={{ maxHeight: listMaxHeight }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}>
            {filteredExercises.length === 0 ? (
              <Text className="py-4 text-center text-sm text-muted-foreground">
                {getEmptyMessage(availableExercises.length, search, activeFilterCount > 0)}
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
