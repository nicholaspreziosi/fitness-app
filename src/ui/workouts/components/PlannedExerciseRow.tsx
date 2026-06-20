import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
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
  exerciseName,
  showDragHandle = false,
  dragHandleRight = false,
  showRemove = false,
  onRemove,
  dragHandle,
  className,
}: PlannedExerciseRowProps) {
  const handleNode = showDragHandle
    ? dragHandle ?? <Icon as={GripVerticalIcon} className="size-4 text-muted-foreground" />
    : null;

  return (
    <View
      className={cn(
        'flex-row items-center gap-2 border-b border-border py-2 bg-card',
        className
      )}>
      {!dragHandleRight ? handleNode : null}
      <Text className="flex-1 text-sm text-foreground">{exerciseName}</Text>
      {dragHandleRight ? handleNode : null}
      {showRemove ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onRemove}>
          <Icon as={XIcon} className="size-4 text-destructive" />
        </Pressable>
      ) : null}
    </View>
  );
}
