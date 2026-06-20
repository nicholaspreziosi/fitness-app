import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { SectionHeader } from '@/src/ui/shared/components/SectionHeader';
import { WorkoutCreateSheet } from '@/src/ui/workouts/components/WorkoutCreateSheet';
import { WorkoutListCard } from '@/src/ui/workouts/components/WorkoutListCard';
import { useTodayActiveWorkouts } from '@/src/ui/workouts/hooks/useTodayActiveWorkouts';
import { useWorkoutSession } from '@/src/ui/workouts/hooks/useWorkoutSession';
import * as React from 'react';
import { Modal, View } from 'react-native';

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
  const { workouts, isLoading, isError } = useTodayActiveWorkouts(today);
  const session = useWorkoutSession({ onNavigateToMode, onNavigateToList });
  const [showCreateSheet, setShowCreateSheet] = React.useState(false);

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer>
        <EmptyState title="Unable to load workouts" description="Please try again." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        title="Workout"
        description="Start or resume today's planned workouts."
      />

      <SectionHeader title="Today's Workout" />

      {workouts.length === 0 ? (
        <View className="gap-4">
          <EmptyState
            title="No planned or in-progress workouts today."
            description="Create a workout to get started."
          />
          <Button onPress={() => setShowCreateSheet(true)}>
            <Text>Create Workout</Text>
          </Button>
        </View>
      ) : (
        <View className="gap-3">
          {workouts.map((workout) => (
            <WorkoutListCard
              key={workout.id}
              workout={workout}
              onStart={session.start}
              onResume={session.resume}
            />
          ))}
        </View>
      )}

      <Modal visible={showCreateSheet} transparent animationType="none" onRequestClose={() => setShowCreateSheet(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <WorkoutCreateSheet date={today} onClose={() => setShowCreateSheet(false)} />
        </View>
      </Modal>
    </ScreenContainer>
  );
}
