import { Text } from '@/components/ui/text';
import { DashboardChartEmptyState } from '@/src/ui/dashboard/components/DashboardEmptyState';
import Svg, { Circle } from 'react-native-svg';
import { View } from 'react-native';

type CompletionDonutChartProps = {
  percentage: number;
  isEmpty?: boolean;
  testID?: string;
};

const SIZE = 160;
const STROKE_WIDTH = 18;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
  const progress = (clampedPercentage / 100) * CIRCUMFERENCE;

  return (
    <View testID={testID} className="rounded-lg border border-border bg-card p-4">
      <View className="items-center">
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#E2E8F0"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#2563EB"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${progress} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <Text className="text-3xl font-semibold text-foreground">{clampedPercentage}%</Text>
        <Text className="mt-1 text-sm text-muted-foreground">Completed</Text>
      </View>
    </View>
  );
}
