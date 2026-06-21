import { Text } from '@/components/ui/text';
import { formatDayLabel } from '@/src/lib/dates/weekBounds';
import { EmptyDayState } from '@/src/ui/workouts/components/EmptyDayState';
import { PlannedWorkoutCard } from '@/src/ui/workouts/components/PlannedWorkoutCard';
import type { PlannerState } from '@/src/ui/workouts/hooks/usePlannerState';
import type { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import * as React from 'react';
import { View } from 'react-native';

type DaySectionProps = {
  date: Date;
  workouts: Workout[];
  exercisesById: Map<string, Exercise>;
  plannerState: PlannerState;
  mutations: ReturnType<typeof useWorkoutMutations>;
  canUseTraining?: boolean;
};

export function DaySection({
  date,
  workouts,
  exercisesById,
  plannerState,
  mutations,
  canUseTraining = true,
}: DaySectionProps) {
  return (
    <View className="gap-6">
      <Text className="text-sm font-semibold text-foreground">{formatDayLabel(date)}</Text>

      {workouts.length === 0 ? (
        <EmptyDayState />
      ) : (
        <View className="gap-1">
          {workouts.map((workout) => (
            <PlannedWorkoutCard
              key={workout.id}
              workout={workout}
              exercisesById={exercisesById}
              plannerState={plannerState}
              mutations={mutations}
              canUseTraining={canUseTraining}
            />
          ))}
        </View>
      )}
    </View>
  );
}
