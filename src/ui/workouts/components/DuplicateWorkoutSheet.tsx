import { startOfDay } from '@/src/lib/dates/weekBounds';
import { InlineDatePickerSheet } from '@/src/ui/shared/components/InlineDatePickerSheet';
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
  const pendingRef = React.useRef(false);

  const handleSelect = async (date: Date) => {
    if (pendingRef.current) {
      return;
    }
    pendingRef.current = true;
    try {
      await duplicateWorkout.mutateAsync({ workoutId, targetDate: date });
      onDuplicated?.(date);
      onClose();
    } finally {
      pendingRef.current = false;
    }
  };

  return (
    <InlineDatePickerSheet
      value={initialDate ?? startOfDay(new Date())}
      onSelect={handleSelect}
    />
  );
}
