import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { SectionHeader } from '@/src/ui/shared/components/SectionHeader';
import { WorkoutListCard } from '@/src/ui/workouts/components/WorkoutListCard';
import { useCanUseTrainingFeatures } from '@/src/ui/profile/hooks/useCanUseTrainingFeatures';
import { useTodayActiveWorkouts } from '@/src/ui/workouts/hooks/useTodayActiveWorkouts';
import { useWorkoutSession } from '@/src/ui/workouts/hooks/useWorkoutSession';
import * as React from 'react';
import { View } from 'react-native';

type WorkoutListViewProps = {
  today?: Date;
  onNavigateToMode: (workoutId: string) => void;
  onNavigateToList: () => void;
};

export function WorkoutListView({
  today = new Date(),
  onNavigateToMode,
  onNavigateToList,
}: WorkoutListViewProps) {
  const { workouts, isLoading, isError, isRefreshing, refetch } = useTodayActiveWorkouts(today);
  const canUseTraining = useCanUseTrainingFeatures();
  const session = useWorkoutSession({ onNavigateToMode, onNavigateToList });

  const handleRefresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <ScreenContainer>
        <PageHeader
          title="Workout"
          description="Start or resume today's planned workouts."
        />
        <SectionHeader title="Today's Workout" />
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer onRefresh={handleRefresh} refreshing={isRefreshing}>
        <EmptyState title="Unable to load workouts" description="Please try again." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onRefresh={handleRefresh} refreshing={isRefreshing}>
      <PageHeader
        title="Workout"
        description="Start or resume today's planned workouts."
      />

      <SectionHeader title="Today's Workout" />

      {workouts.length === 0 ? (
        <EmptyState
          title="No planned or in-progress workouts today."
          description=""
        />
      ) : (
        <View className="gap-3">
          {workouts.map((workout) => (
            <WorkoutListCard
              key={workout.id}
              workout={workout}
              onStart={canUseTraining ? session.start : undefined}
              onResume={canUseTraining ? session.resume : undefined}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
