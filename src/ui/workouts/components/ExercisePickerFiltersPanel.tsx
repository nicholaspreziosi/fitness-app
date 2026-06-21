import { Text } from '@/components/ui/text';
import type { BodyPart } from '@/src/contexts/exercises/domain/exercise.model';
import type { ExerciseListFilters } from '@/src/contexts/exercises/domain/exercise.filters';
import { bodyPartOptions } from '@/src/ui/exercises/utils/exerciseOptions';
import { cn } from '@/lib/utils';
import { Pressable, ScrollView, View } from 'react-native';

export type ExercisePickerFilters = Pick<ExerciseListFilters, 'favoritesOnly' | 'bodyParts'>;

export function countExercisePickerFilters(filters: ExercisePickerFilters): number {
  let count = 0;

  if (filters.favoritesOnly) {
    count += 1;
  }

  if (filters.bodyParts?.length) {
    count += 1;
  }

  return count;
}

type ExercisePickerBodyPartFiltersProps = {
  filters: ExercisePickerFilters;
  onChange: (filters: ExercisePickerFilters) => void;
};

export function ExercisePickerBodyPartFilters({
  filters,
  onChange,
}: ExercisePickerBodyPartFiltersProps) {
  const selectedBodyParts = filters.bodyParts ?? [];

  const toggleBodyPart = (bodyPart: BodyPart) => {
    const isSelected = selectedBodyParts.includes(bodyPart);

    onChange({
      ...filters,
      bodyParts: isSelected
        ? selectedBodyParts.filter((part) => part !== bodyPart)
        : [...selectedBodyParts, bodyPart],
    });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View className="flex-row gap-1.5">
        {bodyPartOptions.map((option) => {
          const isSelected = selectedBodyParts.includes(option.value as BodyPart);

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              testID={`exercise-picker-body-part-${option.value}`}
              className={cn(
                'rounded-full border px-2.5 py-1',
                isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background'
              )}
              onPress={() => toggleBodyPart(option.value as BodyPart)}>
              <Text
                className={cn(
                  'text-xs',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
