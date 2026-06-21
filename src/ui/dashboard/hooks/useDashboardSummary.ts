import { createDashboardService } from '@/src/contexts/dashboard/application/createDashboardService';
import type { DashboardPeriod } from '@/src/contexts/dashboard/domain/dashboard.types';
import { useDashboardWorkouts } from '@/src/ui/dashboard/hooks/useDashboardWorkouts';
import { useMemo } from 'react';

type UseDashboardSummaryOptions = {
  referenceDate?: Date;
};

export function useDashboardSummary(
  period: DashboardPeriod,
  options: UseDashboardSummaryOptions = {}
) {
  const { workouts, isLoading, isRefreshing, isError, error, refetch, rangeStart, rangeEnd } =
    useDashboardWorkouts(period, options);
  const referenceDate = options.referenceDate ?? new Date();

  const summary = useMemo(() => {
    const service = createDashboardService();
    return service.getDashboardSummary(workouts, period, referenceDate);
  }, [workouts, period, referenceDate]);

  return {
    summary,
    workouts,
    rangeStart,
    rangeEnd,
    isLoading,
    isRefreshing,
    isError,
    error,
    refetch,
  };
}
