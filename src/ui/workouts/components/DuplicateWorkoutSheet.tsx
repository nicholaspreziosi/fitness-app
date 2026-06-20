import { DatePickerSheet } from '@/src/ui/shared/components/DatePickerSheet';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import * as React from 'react';

type DuplicateWorkoutSheetProps = {
  workoutId: string;
  initialDate?: Date;
  onClose: () => void;
  onDuplicated?: (date: Date) => void;
};

export function DuplicateWorkoutSheet({
  workoutId,
  initialDate,
  onClose,
  onDuplicated,
}: DuplicateWorkoutSheetProps) {
  const { duplicateWorkout } = useWorkoutMutations();

  return (
    <DatePickerSheet
      title="Duplicate Workout"
      value={initialDate ?? startOfDay(new Date())}
      confirmLabel="Duplicate"
      onClose={onClose}
      onConfirm={async (date) => {
        await duplicateWorkout.mutateAsync({ workoutId, targetDate: date });
        onDuplicated?.(date);
        onClose();
      }}
    />
  );
}
