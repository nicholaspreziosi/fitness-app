import { Text } from '@/components/ui/text';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { UpcomingWorkoutRow } from '@/src/ui/dashboard/components/UpcomingWorkoutRow';
import { View } from 'react-native';

type UpcomingWorkoutListProps = {
  workouts: Workout[];
  testID?: string;
};

export function UpcomingWorkoutList({
  workouts,
  testID = 'upcoming-workout-list',
}: UpcomingWorkoutListProps) {
  if (workouts.length === 0) {
    return null;
  }

  return (
    <View testID={testID} className="gap-3">
      {workouts.map((workout) => (
        <UpcomingWorkoutRow key={workout.id} workout={workout} testID={`${testID}-${workout.id}`} />
      ))}
    </View>
  );
}

export function UpcomingSectionHeader() {
  return <Text className="text-base font-semibold text-foreground">Upcoming</Text>;
}
