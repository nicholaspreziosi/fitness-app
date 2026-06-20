import { filterActiveWorkoutsForDate } from '@/src/contexts/workouts/domain/workoutSession.rules';
import { useWeeklyWorkouts } from '@/src/ui/workouts/hooks/useWeeklyWorkouts';

export function useTodayActiveWorkouts(date: Date = new Date()) {
  const { workouts, isLoading, isError, error, refetch } = useWeeklyWorkouts(date);

  return {
    workouts: filterActiveWorkoutsForDate(workouts, date),
    isLoading,
    isError,
    error,
    refetch,
  };
}
