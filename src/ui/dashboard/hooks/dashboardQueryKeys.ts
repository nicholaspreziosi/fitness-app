import type { DashboardViewMode } from '@/src/contexts/dashboard/domain/dashboard.types';

export function dashboardQueryKeys(userId: string) {
  return {
    all: ['dashboard', userId] as const,
    viewMode: (viewMode: DashboardViewMode, rangeStartIso: string) =>
      ['dashboard', userId, viewMode, rangeStartIso] as const,
  };
}
