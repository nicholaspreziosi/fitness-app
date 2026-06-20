import { Text } from '@/components/ui/text';
import {
  estimateWorkoutDuration,
  formatEstimatedDuration,
} from '@/src/contexts/workouts/domain/workoutDuration';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { getDayName } from '@/src/lib/dates/weekBounds';
import { View } from 'react-native';

type UpcomingWorkoutRowProps = {
  workout: Workout;
  testID?: string;
};

export function UpcomingWorkoutRow({ workout, testID }: UpcomingWorkoutRowProps) {
  const dayLabel = workout.date ? getDayName(workout.date) : 'Unscheduled';
  const estimatedMinutes = estimateWorkoutDuration(workout.exercises);
  const exerciseLabel =
    workout.exercises.length === 1 ? '1 exercise' : `${workout.exercises.length} exercises`;

  return (
    <View
      testID={testID}
      className="rounded-lg border border-border bg-card p-4">
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {dayLabel}
      </Text>
      <Text className="mt-1 text-base font-medium text-foreground">{workout.name}</Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        {exerciseLabel} · {formatEstimatedDuration(estimatedMinutes)}
      </Text>
    </View>
  );
}
