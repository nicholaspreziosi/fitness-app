import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { DashboardPeriod } from '@/src/contexts/dashboard/domain/dashboard.types';
import { getPeriodRange } from '@/src/contexts/dashboard/domain/dashboardPeriod';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
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
  const referenceDate = options.referenceDate ?? new Date();
  const { start, end } = getPeriodRange(period, referenceDate);
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
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
