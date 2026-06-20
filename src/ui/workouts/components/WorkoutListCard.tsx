import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { estimateWorkoutDuration } from '@/src/contexts/workouts/domain/workoutDuration';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { WorkoutCard } from '@/src/ui/workouts/components/WorkoutCard';
import * as React from 'react';
import { View } from 'react-native';

type WorkoutListCardProps = {
  workout: Workout;
  onStart: (workoutId: string) => void;
  onResume: (workoutId: string) => void;
};

export function WorkoutListCard({ workout, onStart, onResume }: WorkoutListCardProps) {
  const completedCount = workout.exercises.filter((exercise) => exercise.completed).length;
  const estimatedMinutes = estimateWorkoutDuration(workout.exercises);
  const isInProgress = workout.status === 'inProgress';

  return (
    <WorkoutCard
      name={workout.name}
      status={workout.status}
      exerciseCount={workout.exercises.length}
      completedCount={completedCount}
      estimatedMinutes={estimatedMinutes}>
      <View className="mt-3 border-t border-border pt-3">
        <Button
          onPress={() => (isInProgress ? onResume(workout.id) : onStart(workout.id))}
          accessibilityLabel={isInProgress ? 'Resume Workout' : 'Start Workout'}>
          <Text>{isInProgress ? 'Resume Workout' : 'Start Workout'}</Text>
        </Button>
      </View>
    </WorkoutCard>
  );
}
