import type { DashboardPeriod } from '@/src/contexts/dashboard/domain/dashboard.types';

export function dashboardQueryKeys(userId: string) {
  return {
    all: ['dashboard', userId] as const,
    period: (period: DashboardPeriod, rangeStartIso: string) =>
      ['dashboard', userId, period, rangeStartIso] as const,
  };
}
