import { Text } from '@/components/ui/text';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { canAddExerciseToWorkout } from '@/src/contexts/workouts/domain/planner.rules';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

type ExercisePickerSheetProps = {
  workout: Workout;
  onClose: () => void;
};

export function ExercisePickerSheet({ workout, onClose }: ExercisePickerSheetProps) {
  const { exercises, isLoading } = useExerciseLibrary();
  const { addExercise } = useWorkoutMutations();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSelect = async (exerciseId: string) => {
    const rule = canAddExerciseToWorkout(workout, exerciseId);

    if (!rule.allowed) {
      setErrorMessage(rule.message);
      return;
    }

    await addExercise.mutateAsync({ workoutId: workout.id, exerciseId });
    onClose();
  };

  return (
    <View className="gap-3 rounded-t-2xl border border-border bg-card p-4">
      <Text className="text-lg font-semibold text-foreground">Add Exercise</Text>
      {errorMessage ? <Text className="text-sm text-destructive">{errorMessage}</Text> : null}
      {isLoading ? (
        <Text className="text-sm text-muted-foreground">Loading exercises...</Text>
      ) : (
        <ScrollView className="max-h-72">
          <View className="gap-1">
            {exercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                accessibilityRole="button"
                className="rounded-lg border border-border px-3 py-3"
                onPress={() => handleSelect(exercise.id)}>
                <Text className="text-sm text-foreground">{exercise.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
