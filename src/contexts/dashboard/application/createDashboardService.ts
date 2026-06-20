import { DashboardService } from '@/src/contexts/dashboard/application/dashboard.service';

export function createDashboardService(): DashboardService {
  return new DashboardService();
}
