import { Text } from '@/components/ui/text';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { calculateWorkoutProgress } from '@/src/contexts/workouts/domain/workoutSession.rules';
import { SectionHeader } from '@/src/ui/shared/components/SectionHeader';
import { View } from 'react-native';

type WorkoutProgressCardProps = {
  workout: Pick<Workout, 'exercises'>;
};

export function WorkoutProgressCard({ workout }: WorkoutProgressCardProps) {
  const progress = calculateWorkoutProgress(workout);

  return (
    <View className="rounded-lg border border-border bg-card px-4 py-4">
      <SectionHeader
        title={`${progress.completed} of ${progress.total} exercises complete`}
        description={`${progress.percentComplete}% complete`}
      />
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <View
          className="h-full rounded-full bg-brand"
          style={{ width: `${progress.percentComplete}%` }}
        />
      </View>
      {progress.setsCompleted > 0 ? (
        <Text className="mt-2 text-xs text-muted-foreground">
          {progress.setsCompleted} set{progress.setsCompleted === 1 ? '' : 's'} logged
        </Text>
      ) : null}
    </View>
  );
}
