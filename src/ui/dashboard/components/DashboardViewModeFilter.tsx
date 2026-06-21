import type { DashboardViewMode } from '@/src/contexts/dashboard/domain/dashboard.types';
import { SegmentedControl } from '@/src/ui/shared/components/SegmentedControl';

const VIEW_MODE_OPTIONS = [
  { label: 'Week', value: 'week' as const },
  { label: 'Month', value: 'month' as const },
];

type DashboardViewModeFilterProps = {
  value: DashboardViewMode;
  onChange: (viewMode: DashboardViewMode) => void;
};

export function DashboardViewModeFilter({ value, onChange }: DashboardViewModeFilterProps) {
  return (
    <SegmentedControl
      testID="dashboard-view-mode-filter"
      options={VIEW_MODE_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
