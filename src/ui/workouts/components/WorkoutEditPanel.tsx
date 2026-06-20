import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { canEditWorkoutExercises } from '@/src/contexts/workouts/domain/planner.rules';
import { sortWorkoutExercises } from '@/src/contexts/workouts/domain/planner.helpers';
import { DatePickerField } from '@/src/ui/shared/components/DatePickerField';
import { ConfirmDialog } from '@/src/ui/shared/components/ConfirmDialog';
import { PopoverMenu } from '@/src/ui/shared/components/PopoverMenu';
import { ExerciseReorderList } from '@/src/ui/workouts/components/plannerDnD';
import { ChevronDownIcon, PlusIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

type WorkoutEditPanelProps = {
  exercises: WorkoutExercise[];
  exercisesById: Map<string, Exercise>;
  workoutDate: Date;
  canChangeDate: boolean;
  dateChangeDisabledMessage?: string;
  onAddExercise: () => void;
  onAddTemplate: () => void;
  onDateChange: (date: Date) => void;
  onRemoveExercise: (workoutExerciseId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  pendingDateConfirmation?: Date | null;
  onConfirmDateChange?: () => void;
  onCancelDateChange?: () => void;
};

export function WorkoutEditPanel({
  exercises,
  exercisesById,
  workoutDate,
  canChangeDate,
  dateChangeDisabledMessage,
  onAddExercise,
  onAddTemplate,
  onDateChange,
  onRemoveExercise,
  onReorder,
  pendingDateConfirmation,
  onConfirmDateChange,
  onCancelDateChange,
}: WorkoutEditPanelProps) {
  const sorted = React.useMemo(() => sortWorkoutExercises(exercises), [exercises]);

  const addMenuItems = React.useMemo(
    () => [
      {
        label: 'Exercises',
        testID: 'add-exercises',
        onPress: onAddExercise,
      },
      {
        label: 'Templates',
        testID: 'add-templates',
        onPress: onAddTemplate,
      },
    ],
    [onAddExercise, onAddTemplate]
  );

  return (
    <View className="mt-3 gap-3 border-t border-border pt-3">
      <Text className="text-sm font-medium text-foreground">Date</Text>
      <View className="flex-row items-center justify-between gap-2">
        <DatePickerField
          showLabel={false}
          value={workoutDate}
          onChange={onDateChange}
          disabled={!canChangeDate}
        />
        <PopoverMenu
          items={addMenuItems}
          accessibilityLabel="Add exercises or templates"
          menuAlign="end"
          trigger={
            <Button variant="outline" size="sm" testID="add-workout-content">
              <Icon as={PlusIcon} className="size-3.5 text-foreground" />
              <Text>Add</Text>
              <Icon as={ChevronDownIcon} className="size-3.5 text-muted-foreground" />
            </Button>
          }
        />
      </View>
      {!canChangeDate && dateChangeDisabledMessage ? (
        <Text className="text-xs text-muted-foreground">{dateChangeDisabledMessage}</Text>
      ) : null}

      <ExerciseReorderList
        exercises={sorted}
        exercisesById={exercisesById}
        onReorder={onReorder}
        onRemoveExercise={onRemoveExercise}
      />

      <ConfirmDialog
        hideTrigger
        open={Boolean(pendingDateConfirmation)}
        onOpenChange={(open) => {
          if (!open) {
            onCancelDateChange?.();
          }
        }}
        triggerLabel=""
        title="Move in-progress workout?"
        description="This workout is currently in progress. Moving it to another date will keep your session data."
        confirmLabel="Move"
        onConfirm={onConfirmDateChange}
      />
    </View>
  );
}

export function canEnterEditMode(status: Parameters<typeof canEditWorkoutExercises>[0]) {
  return canEditWorkoutExercises(status).allowed;
}
