import { Text } from '@/components/ui/text';
import { DashboardChartEmptyState } from '@/src/ui/dashboard/components/DashboardEmptyState';
import { PolarChart, Pie } from 'victory-native';
import { View } from 'react-native';

type CompletionDonutChartProps = {
  percentage: number;
  isEmpty?: boolean;
  testID?: string;
};

const COMPLETED_COLOR = '#2563EB';
const REMAINING_COLOR = '#E2E8F0';

export function CompletionDonutChart({
  percentage,
  isEmpty = false,
  testID = 'completion-donut-chart',
}: CompletionDonutChartProps) {
  if (isEmpty) {
    return (
      <DashboardChartEmptyState
        testID={`${testID}-empty`}
        message="Complete workouts to see training coverage."
      />
    );
  }

  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const chartData = [
    { label: 'Completed', value: clampedPercentage, color: COMPLETED_COLOR },
    { label: 'Remaining', value: 100 - clampedPercentage, color: REMAINING_COLOR },
  ];

  return (
    <View testID={testID} className="rounded-lg border border-border bg-card p-4">
      <View className="items-center">
        <View className="h-44 w-full">
          <PolarChart
            data={chartData}
            labelKey="label"
            valueKey="value"
            colorKey="color"
            canvasSize={{ width: 280, height: 176 }}>
            <Pie.Chart innerRadius="62%" />
          </PolarChart>
        </View>
        <Text className="text-3xl font-semibold text-foreground">{clampedPercentage}%</Text>
        <Text className="mt-1 text-sm text-muted-foreground">Completed</Text>
      </View>
    </View>
  );
}
