import { addMonths } from '@/src/lib/dates/monthBounds';
import { addWeeks, startOfDay } from '@/src/lib/dates/weekBounds';
import type { DashboardViewMode } from '@/src/contexts/dashboard/domain/dashboard.types';
import { useCallback, useRef, useState } from 'react';

export function useDashboardViewState(initialAnchorDate = new Date()) {
  const [viewMode, setViewMode] = useState<DashboardViewMode>('week');
  const [anchorDate, setAnchorDate] = useState(() => startOfDay(initialAnchorDate));
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const goToPrevious = useCallback(() => {
    setAnchorDate((current) =>
      viewModeRef.current === 'week' ? addWeeks(current, -1) : addMonths(current, -1)
    );
  }, []);

  const goToNext = useCallback(() => {
    setAnchorDate((current) =>
      viewModeRef.current === 'week' ? addWeeks(current, 1) : addMonths(current, 1)
    );
  }, []);

  const goToDate = useCallback((date: Date) => {
    setAnchorDate(startOfDay(date));
  }, []);

  return {
    viewMode,
    setViewMode,
    anchorDate,
    goToPrevious,
    goToNext,
    goToDate,
  };
}
