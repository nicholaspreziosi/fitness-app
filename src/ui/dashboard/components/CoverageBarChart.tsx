import { Text } from '@/components/ui/text';
import type { CoverageItem } from '@/src/contexts/dashboard/domain/dashboard.types';
import { DashboardChartEmptyState } from '@/src/ui/dashboard/components/DashboardEmptyState';
import { CartesianChart, HorizontalBar } from 'victory-native';
import { View } from 'react-native';

type CoverageBarChartProps = {
  coverage: CoverageItem[];
  isEmpty?: boolean;
  testID?: string;
};

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

  const chartData = coverage.map((item) => ({
    bodyPart: item.bodyPart,
    count: item.count,
  }));
  const maxCount = Math.max(...chartData.map((item) => item.count), 1);

  return (
    <View testID={testID} className="rounded-lg border border-border bg-card p-4">
      <Text className="mb-3 text-sm font-medium text-foreground">Most Hit Body Parts</Text>
      <View className="h-56 w-full">
        <CartesianChart
          orientation="horizontal"
          data={chartData}
          xKey="bodyPart"
          yKeys={['count']}
          domain={{ x: [0, maxCount + 1] }}
          domainPadding={{ top: 16, bottom: 16, right: 16 }}>
          {({ points, chartBounds }) => (
            <HorizontalBar
              points={points.count}
              chartBounds={chartBounds}
              color="#2563EB"
              roundedCorners={{ topRight: 6, bottomRight: 6 }}
            />
          )}
        </CartesianChart>
      </View>
      <View className="mt-3 gap-2">
        {coverage.map((item) => (
          <View key={item.bodyPart} className="flex-row items-center justify-between">
            <Text className="text-sm text-foreground">{item.bodyPart}</Text>
            <Text className="text-sm font-medium text-foreground">{item.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
