import { createDashboardService } from '@/src/contexts/dashboard/application/createDashboardService';
import type { DashboardViewMode } from '@/src/contexts/dashboard/domain/dashboard.types';
import { useDashboardWorkouts } from '@/src/ui/dashboard/hooks/useDashboardWorkouts';
import { useWeekStartDay } from '@/src/ui/profile/hooks/useWeekStartDay';
import { useMemo } from 'react';

type UseDashboardSummaryOptions = {
  anchorDate?: Date;
};

export function useDashboardSummary(
  viewMode: DashboardViewMode,
  options: UseDashboardSummaryOptions = {}
) {
  const weekStartDay = useWeekStartDay();
  const anchorDate = options.anchorDate ?? new Date();
  const { workouts, isLoading, isRefreshing, isError, error, refetch, rangeStart, rangeEnd } =
    useDashboardWorkouts(viewMode, { anchorDate });

  const summary = useMemo(() => {
    const service = createDashboardService();
    return service.getDashboardSummary(workouts, viewMode, anchorDate, weekStartDay);
  }, [workouts, viewMode, anchorDate, weekStartDay]);

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
