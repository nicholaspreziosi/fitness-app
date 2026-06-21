import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { getWeekBounds } from '@/src/lib/dates/weekBounds';
import { useWeekStartDay } from '@/src/ui/profile/hooks/useWeekStartDay';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

export function useWeeklyWorkouts(weekAnchor: Date) {
  const { user } = useAuth();
  const userId = user?.id;
  const weekStartDay = useWeekStartDay();
  const { weekStart, weekEnd } = getWeekBounds(weekAnchor, weekStartDay);
  const weekStartIso = weekStart.toISOString();

  const query = useQuery({
    queryKey: workoutQueryKeys(userId ?? '').week(weekStartIso),
    enabled: Boolean(userId),
    retry: false,
    queryFn: async (): Promise<Workout[]> => {
      const service = createWorkoutService(userId!);
      return service.listWorkoutsByWeek(weekStart, weekEnd);
    },
  });

  return {
    workouts: query.data ?? [],
    weekStart,
    weekEnd,
    isLoading: query.isLoading && query.data === undefined,
    isRefreshing: query.isFetching && query.data !== undefined,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
