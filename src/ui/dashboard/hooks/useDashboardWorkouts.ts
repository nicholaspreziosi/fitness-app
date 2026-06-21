import { getDashboardRange } from '@/src/contexts/dashboard/domain/dashboardPeriod';
import type { DashboardViewMode } from '@/src/contexts/dashboard/domain/dashboard.types';
import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { useWeekStartDay } from '@/src/ui/profile/hooks/useWeekStartDay';
import { dashboardQueryKeys } from '@/src/ui/dashboard/hooks/dashboardQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

type UseDashboardWorkoutsOptions = {
  anchorDate?: Date;
};

export function useDashboardWorkouts(
  viewMode: DashboardViewMode,
  options: UseDashboardWorkoutsOptions = {}
) {
  const { user } = useAuth();
  const userId = user?.id;
  const weekStartDay = useWeekStartDay();
  const anchorDate = options.anchorDate ?? new Date();
  const { start, end } = getDashboardRange(viewMode, anchorDate, weekStartDay);
  const rangeStartIso = start.toISOString();

  const query = useQuery({
    queryKey: dashboardQueryKeys(userId ?? '').viewMode(viewMode, rangeStartIso),
    enabled: Boolean(userId),
    retry: false,
    queryFn: async (): Promise<Workout[]> => {
      const service = createWorkoutService(userId!);
      return service.listWorkoutsByDateRange(start, end);
    },
  });

  return {
    workouts: query.data ?? [],
    rangeStart: start,
    rangeEnd: end,
    isLoading: query.isLoading && query.data === undefined,
    isRefreshing: query.isRefetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
