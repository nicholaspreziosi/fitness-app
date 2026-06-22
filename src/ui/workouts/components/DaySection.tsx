import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { formatDayLabel, getDayName, isSameDay } from '@/src/lib/dates/weekBounds';
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
  const isToday = isSameDay(date, new Date());
  const shortDayName = getDayName(date).slice(0, 3);
  const hasWorkouts = workouts.length > 0;

  return (
    <View
      className={cn(
        'gap-6 md:flex md:shrink-0 md:flex-col md:gap-3',
        hasWorkouts && 'md:min-w-72'
      )}>
      <Text className="text-sm font-semibold text-foreground md:hidden">{formatDayLabel(date)}</Text>

      <View
        className={cn(
          'hidden md:flex md:flex-col md:items-center md:gap-0.5 md:border-b md:border-border md:pb-3',
          isToday && 'md:border-brand'
        )}>
        <Text
          className={cn(
            'text-xs font-medium uppercase tracking-wide text-muted-foreground',
            isToday && 'text-brand'
          )}>
          {shortDayName}
        </Text>
        <Text className={cn('text-lg font-semibold text-foreground', isToday && 'text-brand')}>
          {date.getDate()}
        </Text>
      </View>

      {workouts.length === 0 ? (
        <EmptyDayState className="md:px-2 md:py-3" />
      ) : (
        <View className="gap-1 md:gap-2">
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
