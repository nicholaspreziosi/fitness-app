import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import type { DefaultUpdateField } from '@/src/contexts/workouts/domain/progression';
import type {
  DefaultUpdateSelection,
  ExerciseDefaultUpdateReview,
} from '@/src/ui/workouts/hooks/useProgressionPrompt';
import { getWeightLabel } from '@/src/lib/measurements/labels';
import { useMeasurementSystem } from '@/src/ui/profile/hooks/useMeasurementSystem';
import * as React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

type ProgressionPromptSheetProps = {
  reviews: ExerciseDefaultUpdateReview[];
  isOpen: boolean;
  onApply: (selections: DefaultUpdateSelection[]) => void;
  onSkip: () => void;
  onClose: () => void;
};

const BASE_FIELD_LABELS: Record<Exclude<DefaultUpdateField, 'defaultWeight'>, string> = {
  defaultSets: 'Sets',
  defaultReps: 'Reps',
  defaultHoldSeconds: 'Hold (sec)',
};

function getFieldLabel(field: DefaultUpdateField, measurementSystem: 'imperial' | 'metric'): string {
  if (field === 'defaultWeight') {
    return getWeightLabel(measurementSystem);
  }

  return BASE_FIELD_LABELS[field];
}

function selectionKey(exerciseId: string, field: DefaultUpdateField): string {
  return `${exerciseId}:${field}`;
}

function buildInitialSelection(reviews: ExerciseDefaultUpdateReview[]): Set<string> {
  return new Set(
    reviews.flatMap((review) =>
      review.items.map((item) => selectionKey(review.exerciseId, item.field))
    )
  );
}

function formatReviewItem(item: ExerciseDefaultUpdateReview['items'][number]): string {
  return `${item.plannedValue} → ${item.actualValue}`;
}

export function ProgressionPromptSheet({
  reviews,
  isOpen,
  onApply,
  onSkip,
  onClose,
}: ProgressionPromptSheetProps) {
  const measurementSystem = useMeasurementSystem();
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (isOpen) {
      setSelectedKeys(buildInitialSelection(reviews));
    }
  }, [isOpen, reviews]);

  const toggleSelection = (exerciseId: string, field: DefaultUpdateField) => {
    const key = selectionKey(exerciseId, field);
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleApply = () => {
    const selections = reviews.map((review) => ({
      exerciseId: review.exerciseId,
      fields: review.items
        .filter((item) => selectedKeys.has(selectionKey(review.exerciseId, item.field)))
        .map((item) => item.field),
    }));

    onApply(selections);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[85%] gap-4 rounded-t-2xl border border-border bg-card p-4">
          <View className="gap-1">
            <Text className="text-lg font-semibold text-foreground">Update exercise defaults?</Text>
            <Text className="text-sm text-muted-foreground">
              You exceeded planned values. Choose which updates to apply to your exercise library
              defaults.
            </Text>
          </View>

          <ScrollView className="max-h-80">
            <View className="gap-3">
              {reviews.map((review) => (
                <View
                  key={review.exerciseId}
                  className="gap-2 rounded-lg border border-border bg-background p-3">
                  <Text className="font-medium text-foreground">{review.exerciseName}</Text>
                  {review.items.map((item) => {
                    const key = selectionKey(review.exerciseId, item.field);
                    const checked = selectedKeys.has(key);
                    const label = `${getFieldLabel(item.field, measurementSystem)}: ${formatReviewItem(item)}`;

                    return (
                      <Pressable
                        key={key}
                        accessibilityRole="checkbox"
                        aria-checked={checked}
                        accessibilityLabel={label}
                        className="flex-row items-center gap-3 rounded-lg px-1 py-1 active:opacity-80"
                        onPress={() => toggleSelection(review.exerciseId, item.field)}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSelection(review.exerciseId, item.field)}
                        />
                        <View className="flex-1">
                          <Label>{getFieldLabel(item.field, measurementSystem)}</Label>
                          <Text className="text-sm text-muted-foreground">
                            {formatReviewItem(item)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row gap-2">
            <Button className="flex-1" variant="outline" onPress={onSkip}>
              <Text>Skip all</Text>
            </Button>
            <Button className="flex-1" onPress={handleApply}>
              <Text>Apply selected</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
