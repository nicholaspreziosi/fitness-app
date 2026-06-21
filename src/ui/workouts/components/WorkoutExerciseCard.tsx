import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  formatWorkoutExerciseSummaryPrescription,
  seedActualsFromPlanned,
} from '@/src/contexts/workouts/domain/workoutPresentation';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { getActualWeightLabel } from '@/src/lib/measurements/labels';
import { useMeasurementSystem } from '@/src/ui/profile/hooks/useMeasurementSystem';
import { useRefreshGuardInputHandlers } from '@/src/ui/shared/providers/RefreshGuardProvider';
import { ChevronDownIcon, GripVerticalIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type WorkoutExercisePatch = Partial<
  Pick<
    WorkoutExercise,
    'completed' | 'actualSets' | 'actualReps' | 'actualHoldSeconds' | 'actualWeight' | 'notes'
  >
>;

type WorkoutExerciseCardProps = {
  exercise: WorkoutExercise;
  exerciseName: string;
  onChange: (patch: WorkoutExercisePatch) => void;
  showDragHandle?: boolean;
  dragHandleRight?: boolean;
  dragHandle?: React.ReactNode;
  className?: string;
  embedded?: boolean;
};

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function NumberField({
  label,
  value,
  onChangeValue,
  inputHandlers,
}: {
  label: string;
  value?: number;
  onChangeValue: (value: number | undefined) => void;
  inputHandlers?: {
    onFocus: () => void;
    onBlur: () => void;
  };
}) {
  return (
    <View className="flex-1 gap-1">
      <Label>{label}</Label>
      <Input
        accessibilityLabel={label}
        keyboardType="numeric"
        value={value === undefined ? '' : String(value)}
        onChangeText={(text) => onChangeValue(parseOptionalNumber(text))}
        onFocus={inputHandlers?.onFocus}
        onBlur={inputHandlers?.onBlur}
      />
    </View>
  );
}

export function WorkoutExerciseCard({
  exercise,
  exerciseName,
  onChange,
  showDragHandle = false,
  dragHandleRight = false,
  dragHandle,
  className,
  embedded = false,
}: WorkoutExerciseCardProps) {
  const measurementSystem = useMeasurementSystem();
  const inputHandlers = useRefreshGuardInputHandlers();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const displayExercise = React.useMemo(() => seedActualsFromPlanned(exercise), [exercise]);
  const prescription = formatWorkoutExerciseSummaryPrescription(exercise, { measurementSystem });

  const showSets = exercise.plannedSets !== undefined || exercise.actualSets !== undefined;
  const showReps = exercise.plannedReps !== undefined || exercise.actualReps !== undefined;
  const showHold =
    exercise.plannedHoldSeconds !== undefined || exercise.actualHoldSeconds !== undefined;
  const showWeight = exercise.plannedWeight !== undefined || exercise.actualWeight !== undefined;

  const toggleExpanded = () => {
    setIsExpanded((current) => !current);
  };

  const handleNode = showDragHandle
    ? dragHandle ?? (
        <Icon as={GripVerticalIcon} className="size-4 text-muted-foreground" />
      )
    : null;

  return (
    <View
      className={cn(
        embedded
          ? 'relative bg-card px-3 py-3'
          : 'rounded-lg border border-border bg-card px-3 py-3',
        !embedded && exercise.completed && 'border-success/20 bg-success/[0.03]',
        className
      )}>
      {embedded && exercise.completed ? (
        <View className="pointer-events-none absolute inset-0 bg-success/[0.03]" />
      ) : null}

      <View className={embedded ? 'relative' : undefined}>
      <View className="flex-row items-center gap-3">
        {!dragHandleRight && showDragHandle ? handleNode : null}

        <Checkbox
          accessibilityRole="checkbox"
          checked={exercise.completed}
          className="size-8 border-[2.5px]"
          iconClassName="size-4"
          onCheckedChange={(checked) => onChange({ completed: Boolean(checked) })}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${exerciseName}${prescription ? `, ${prescription}` : ''}`}
          accessibilityState={{ expanded: isExpanded }}
          className="min-w-0 flex-1 active:opacity-80"
          onPress={toggleExpanded}>
          <Text
            className={cn(
              'text-base font-medium text-foreground',
              exercise.completed && 'text-muted-foreground line-through'
            )}>
            {exerciseName}
          </Text>
          {prescription ? (
            <Text className="mt-1 text-sm text-muted-foreground">{prescription}</Text>
          ) : null}
        </Pressable>

        <Button
          accessibilityLabel={isExpanded ? 'Collapse exercise' : 'Expand exercise'}
          className="size-10 shrink-0"
          testID={isExpanded ? 'exercise-collapse' : 'exercise-expand'}
          variant="ghost"
          onPress={toggleExpanded}>
          <Icon
            as={ChevronDownIcon}
            className={cn('size-5 text-muted-foreground', isExpanded && 'rotate-180')}
          />
        </Button>

        {dragHandleRight && showDragHandle ? handleNode : null}
      </View>

      {isExpanded ? (
        <View className="mt-3 gap-3 border-t border-border pt-3">
          <View className="flex-row flex-wrap gap-3">
            {showSets ? (
              <NumberField
                label="Actual Sets"
                value={displayExercise.actualSets}
                onChangeValue={(actualSets) => onChange({ actualSets })}
                inputHandlers={inputHandlers}
              />
            ) : null}
            {showReps ? (
              <NumberField
                label="Actual Reps"
                value={displayExercise.actualReps}
                onChangeValue={(actualReps) => onChange({ actualReps })}
                inputHandlers={inputHandlers}
              />
            ) : null}
            {showHold ? (
              <NumberField
                label="Actual Hold (sec)"
                value={displayExercise.actualHoldSeconds}
                onChangeValue={(actualHoldSeconds) => onChange({ actualHoldSeconds })}
                inputHandlers={inputHandlers}
              />
            ) : null}
            {showWeight ? (
              <NumberField
                label={getActualWeightLabel(measurementSystem)}
                value={displayExercise.actualWeight}
                onChangeValue={(actualWeight) => onChange({ actualWeight })}
                inputHandlers={inputHandlers}
              />
            ) : null}
          </View>

          <View className="gap-1">
            <Label>Notes</Label>
            <Textarea
              value={exercise.notes ?? ''}
              onChangeText={(notes) => onChange({ notes })}
              placeholder="Optional notes"
              onFocus={inputHandlers.onFocus}
              onBlur={inputHandlers.onBlur}
            />
          </View>
        </View>
      ) : null}
      </View>
    </View>
  );
}
