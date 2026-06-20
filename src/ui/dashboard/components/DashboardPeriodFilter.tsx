import type { DashboardPeriod } from '@/src/contexts/dashboard/domain/dashboard.types';
import { SegmentedControl } from '@/src/ui/shared/components/SegmentedControl';

const PERIOD_OPTIONS = [
  { label: 'This Week', value: 'thisWeek' as const },
  { label: 'Next Week', value: 'nextWeek' as const },
  { label: 'This Month', value: 'thisMonth' as const },
];

type DashboardPeriodFilterProps = {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
};

export function DashboardPeriodFilter({ value, onChange }: DashboardPeriodFilterProps) {
  return (
    <SegmentedControl
      testID="dashboard-period-filter"
      options={PERIOD_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
