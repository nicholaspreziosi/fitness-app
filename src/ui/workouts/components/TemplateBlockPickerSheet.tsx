import { Text } from '@/components/ui/text';
import { useTemplateBlocks } from '@/src/ui/templateBlocks/hooks/useTemplateBlocks';
import { canAddTemplateBlockToWorkout } from '@/src/contexts/workouts/domain/planner.rules';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

type TemplateBlockPickerSheetProps = {
  workout: Workout;
  onClose: () => void;
};

export function TemplateBlockPickerSheet({ workout, onClose }: TemplateBlockPickerSheetProps) {
  const { templateBlocks, isLoading } = useTemplateBlocks();
  const { addTemplateBlock } = useWorkoutMutations();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSelect = async (templateBlockId: string, exerciseIds: string[]) => {
    const rule = canAddTemplateBlockToWorkout(workout, exerciseIds);

    if (!rule.allowed) {
      setErrorMessage(rule.message);
      return;
    }

    await addTemplateBlock.mutateAsync({ workoutId: workout.id, templateBlockId });
    onClose();
  };

  return (
    <View className="gap-3 rounded-t-2xl border border-border bg-card p-4">
      <Text className="text-lg font-semibold text-foreground">Add Template Block</Text>
      {errorMessage ? <Text className="text-sm text-destructive">{errorMessage}</Text> : null}
      {isLoading ? (
        <Text className="text-sm text-muted-foreground">Loading template blocks...</Text>
      ) : (
        <ScrollView className="max-h-72">
          <View className="gap-1">
            {templateBlocks.map((block) => (
              <Pressable
                key={block.id}
                accessibilityRole="button"
                className="rounded-lg border border-border px-3 py-3"
                onPress={() => handleSelect(block.id, block.exerciseIds)}>
                <Text className="text-sm text-foreground">{block.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
