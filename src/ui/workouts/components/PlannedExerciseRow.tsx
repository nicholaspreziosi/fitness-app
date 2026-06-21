import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { formatWorkoutExerciseSummaryPrescription } from '@/src/contexts/workouts/domain/workoutPresentation';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { useMeasurementSystem } from '@/src/ui/profile/hooks/useMeasurementSystem';
import { GripVerticalIcon, XIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type PlannedExerciseRowProps = {
  workoutExercise: WorkoutExercise;
  exerciseName: string;
  showDragHandle?: boolean;
  dragHandleRight?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  dragHandle?: React.ReactNode;
  className?: string;
};

export function PlannedExerciseRow({
  workoutExercise,
  exerciseName,
  showDragHandle = false,
  dragHandleRight = false,
  showRemove = false,
  onRemove,
  dragHandle,
  className,
}: PlannedExerciseRowProps) {
  const measurementSystem = useMeasurementSystem();
  const prescription = formatWorkoutExerciseSummaryPrescription(workoutExercise, {
    measurementSystem,
  });
  const handleNode = showDragHandle
    ? dragHandle ?? <Icon as={GripVerticalIcon} className="size-4 text-muted-foreground" />
    : null;

  return (
    <View
      className={cn(
        'flex-row items-center gap-2 border-b border-border py-2.5 bg-card',
        className
      )}>
      {!dragHandleRight ? handleNode : null}
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium text-foreground">{exerciseName}</Text>
        {prescription ? (
          <Text className="mt-0.5 text-xs text-muted-foreground">{prescription}</Text>
        ) : null}
      </View>
      {dragHandleRight ? handleNode : null}
      {showRemove ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onRemove}>
          <Icon as={XIcon} className="size-4 text-destructive" />
        </Pressable>
      ) : null}
    </View>
  );
}
