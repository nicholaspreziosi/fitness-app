import { getPeriodRange } from '@/src/contexts/dashboard/domain/dashboardPeriod';
import type { DashboardPeriod } from '@/src/contexts/dashboard/domain/dashboard.types';
import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { useWeekStartDay } from '@/src/ui/profile/hooks/useWeekStartDay';
import { dashboardQueryKeys } from '@/src/ui/dashboard/hooks/dashboardQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

type UseDashboardWorkoutsOptions = {
  referenceDate?: Date;
};

export function useDashboardWorkouts(
  period: DashboardPeriod,
  options: UseDashboardWorkoutsOptions = {}
) {
  const { user } = useAuth();
  const userId = user?.id;
  const weekStartDay = useWeekStartDay();
  const referenceDate = options.referenceDate ?? new Date();
  const { start, end } = getPeriodRange(period, referenceDate, weekStartDay);
  const rangeStartIso = start.toISOString();

  const query = useQuery({
    queryKey: dashboardQueryKeys(userId ?? '').period(period, rangeStartIso),
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
