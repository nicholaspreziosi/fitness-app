import { Text } from '@/components/ui/text';
import type { CoverageItem } from '@/src/contexts/dashboard/domain/dashboard.types';
import { DashboardChartEmptyState } from '@/src/ui/dashboard/components/DashboardEmptyState';
import { View } from 'react-native';

type CoverageBarChartProps = {
  coverage: CoverageItem[];
  isEmpty?: boolean;
  testID?: string;
};

const BAR_COLOR = '#2563EB';

export function CoverageBarChart({
  coverage,
  isEmpty = false,
  testID = 'coverage-bar-chart',
}: CoverageBarChartProps) {
  if (isEmpty || coverage.length === 0) {
    return (
      <DashboardChartEmptyState
        testID={`${testID}-empty`}
        message="Complete workouts to see training coverage."
      />
    );
  }

  const maxCount = Math.max(...coverage.map((item) => item.count), 1);

  return (
    <View testID={testID} className="rounded-lg border border-border bg-card p-4">
      <Text className="mb-3 text-sm font-medium text-foreground">Most Hit Body Parts</Text>
      <View className="gap-3">
        {coverage.map((item) => {
          const widthPercent = `${Math.max(8, (item.count / maxCount) * 100)}%`;

          return (
            <View key={item.bodyPart}>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-sm text-foreground">{item.bodyPart}</Text>
                <Text className="text-sm font-medium text-foreground">{item.count}</Text>
              </View>
              <View className="h-2 rounded-full bg-muted">
                <View
                  className="h-2 rounded-full"
                  style={{ width: widthPercent, backgroundColor: BAR_COLOR }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
