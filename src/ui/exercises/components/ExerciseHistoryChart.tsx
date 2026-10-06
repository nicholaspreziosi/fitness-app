import { Text } from '@/components/ui/text';
import {
  getMetricValue,
  type ExerciseHistoryMetric,
  type ExercisePerformancePoint,
} from '@/src/contexts/workouts/domain/exercisePerformanceHistory';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { SegmentedControl } from '@/src/ui/shared/components/SegmentedControl';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const METRIC_OPTIONS: Array<{ label: string; value: ExerciseHistoryMetric; emptyLabel: string }> = [
  { label: 'Weight', value: 'weight', emptyLabel: 'weight' },
  { label: 'Reps', value: 'reps', emptyLabel: 'reps' },
  { label: 'Sets', value: 'sets', emptyLabel: 'sets' },
  { label: 'Hold', value: 'holdSeconds', emptyLabel: 'hold' },
];

const CHART_COLOR = '#84CC16';
const MUTED_COLOR = '#737373';
const BORDER_COLOR = '#E5E5E5';
const CHART_HEIGHT = 200;
const Y_AXIS_LABEL_WIDTH = 40;
const INITIAL_SPACING = 20;
const END_SPACING = 20;
const TOOLTIP_WIDTH = 72;
const TOOLTIP_HEIGHT = 44;
const TOOLTIP_GAP = 10;
const DATA_POINT_RADIUS = 4;

// gifted-charts gives its default SVG data points press handlers. On web, react-native-svg
// forwards those as responder props to the DOM, which React logs as unknown event handlers.
// A plain View data point keeps the same look with no press handlers attached.
function renderDataPoint() {
  return (
    <View
      style={{
        width: DATA_POINT_RADIUS * 2,
        height: DATA_POINT_RADIUS * 2,
        borderRadius: DATA_POINT_RADIUS,
        backgroundColor: CHART_COLOR,
      }}
    />
  );
}

type ExerciseHistoryChartProps = {
  history?: ExercisePerformancePoint[];
  isLoading?: boolean;
  testID?: string;
};

type ChartPoint = {
  value: number;
  label: string;
};

function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatMetricTooltipValue(metric: ExerciseHistoryMetric, value: number): string {
  switch (metric) {
    case 'weight':
      return `${value} lbs`;
    case 'holdSeconds':
      return `${value}s`;
    case 'reps':
    case 'sets':
    default:
      return String(value);
  }
}

function getDefaultMetric(history: ExercisePerformancePoint[]): ExerciseHistoryMetric {
  for (const option of METRIC_OPTIONS) {
    if (history.some((point) => getMetricValue(point, option.value) !== undefined)) {
      return option.value;
    }
  }
  return 'weight';
}

export function buildChartPoints(
  history: ExercisePerformancePoint[],
  metric: ExerciseHistoryMetric
): ChartPoint[] {
  return history
    .map((point) => {
      const value = getMetricValue(point, metric);
      if (value === undefined) {
        return null;
      }
      return {
        value,
        label: formatShortDate(point.date),
      };
    })
    .filter((point): point is ChartPoint => point !== null);
}

export function getActiveIndexFromX(params: {
  locationX: number;
  pointCount: number;
  spacing: number;
  yAxisLabelWidth?: number;
  initialSpacing?: number;
}): number {
  const {
    locationX,
    pointCount,
    spacing,
    yAxisLabelWidth = Y_AXIS_LABEL_WIDTH,
    initialSpacing = INITIAL_SPACING,
  } = params;

  if (pointCount <= 0) {
    return 0;
  }

  const relativeX = locationX - yAxisLabelWidth - initialSpacing;
  const index = Math.round(relativeX / spacing);
  return Math.max(0, Math.min(pointCount - 1, index));
}

export function getPointPosition(params: {
  index: number;
  value: number;
  maxValue: number;
  spacing: number;
  chartHeight?: number;
  yAxisLabelWidth?: number;
  initialSpacing?: number;
}): { x: number; y: number } {
  const {
    index,
    value,
    maxValue,
    spacing,
    chartHeight = CHART_HEIGHT,
    yAxisLabelWidth = Y_AXIS_LABEL_WIDTH,
    initialSpacing = INITIAL_SPACING,
  } = params;

  const safeMax = Math.max(maxValue, 1);
  return {
    x: yAxisLabelWidth + initialSpacing + index * spacing,
    y: chartHeight - (value / safeMax) * chartHeight,
  };
}

function MetricTooltip({
  metric,
  value,
  label,
}: {
  metric: ExerciseHistoryMetric;
  value: number;
  label?: string;
}) {
  return (
    <View
      testID="exercise-history-tooltip"
      className="rounded-md border border-border bg-card px-2 py-1.5 shadow-sm">
      <Text className="text-center text-xs font-medium text-foreground">
        {formatMetricTooltipValue(metric, value)}
      </Text>
      {label ? (
        <Text className="text-center text-[10px] text-muted-foreground">{label}</Text>
      ) : null}
    </View>
  );
}

export function ExerciseHistoryChart({
  history = [],
  isLoading = false,
  testID = 'exercise-history-chart',
}: ExerciseHistoryChartProps) {
  const [metric, setMetric] = useState<ExerciseHistoryMetric>(() => getDefaultMetric(history));
  const [hasUserSelectedMetric, setHasUserSelectedMetric] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (!hasUserSelectedMetric) {
      setMetric(getDefaultMetric(history));
    }
  }, [history, hasUserSelectedMetric]);

  useEffect(() => {
    setActiveIndex(null);
  }, [metric, history]);

  const chartPoints = useMemo(() => buildChartPoints(history, metric), [history, metric]);
  const emptyLabel =
    METRIC_OPTIONS.find((option) => option.value === metric)?.emptyLabel ?? 'weight';

  const spacing = useMemo(() => {
    if (chartPoints.length <= 1) {
      return 80;
    }
    const usableWidth = Math.max(
      chartWidth - Y_AXIS_LABEL_WIDTH - INITIAL_SPACING - END_SPACING,
      80
    );
    return Math.max(48, usableWidth / (chartPoints.length - 1));
  }, [chartPoints.length, chartWidth]);

  const maxValue = useMemo(() => {
    const rawMax = Math.max(...chartPoints.map((point) => point.value), 1);
    return rawMax;
  }, [chartPoints]);

  const activateAtX = (locationX: number) => {
    if (chartPoints.length === 0) {
      return;
    }
    setActiveIndex(
      getActiveIndexFromX({
        locationX,
        pointCount: chartPoints.length,
        spacing,
      })
    );
  };

  const handleTouch = (event: GestureResponderEvent) => {
    activateAtX(event.nativeEvent.locationX);
  };

  const handleChartLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  const webHoverProps =
    Platform.OS === 'web'
      ? {
          onMouseMove: (event: { nativeEvent: { offsetX?: number; locationX?: number } }) => {
            const locationX = event.nativeEvent.offsetX ?? event.nativeEvent.locationX ?? 0;
            activateAtX(locationX);
          },
          onMouseLeave: () => setActiveIndex(null),
        }
      : {};

  if (isLoading) {
    return (
      <View testID={testID} className="rounded-lg border border-border bg-card p-4">
        <LoadingState />
      </View>
    );
  }

  const activePoint = activeIndex !== null ? chartPoints[activeIndex] : null;
  const activePosition =
    activeIndex !== null && activePoint
      ? getPointPosition({
          index: activeIndex,
          value: activePoint.value,
          maxValue,
          spacing,
        })
      : null;

  return (
    <View testID={testID} className="rounded-lg border border-border bg-card p-4">
      <SegmentedControl
        testID="exercise-history-metric"
        options={METRIC_OPTIONS.map(({ label, value }) => ({ label, value }))}
        value={metric}
        onChange={(value) => {
          setHasUserSelectedMetric(true);
          setMetric(value);
        }}
        className="mb-4"
      />

      {chartPoints.length === 0 ? (
        <Text className="text-sm text-muted-foreground">
          Complete workouts with logged {emptyLabel} to see history.
        </Text>
      ) : (
        <View testID="exercise-history-chart-plot" onLayout={handleChartLayout}>
          <View style={{ position: 'relative' }}>
            <LineChart
              data={chartPoints}
              height={CHART_HEIGHT}
              maxValue={maxValue}
              mostNegativeValue={0}
              overflowTop={0}
              yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
              initialSpacing={INITIAL_SPACING}
              endSpacing={END_SPACING}
              spacing={spacing}
              color={CHART_COLOR}
              thickness={2}
              dataPointsColor={CHART_COLOR}
              dataPointsRadius={DATA_POINT_RADIUS}
              dataPointsWidth={DATA_POINT_RADIUS * 2}
              dataPointsHeight={DATA_POINT_RADIUS * 2}
              customDataPoint={renderDataPoint}
              startFillColor={CHART_COLOR}
              endFillColor={CHART_COLOR}
              startOpacity={0.15}
              endOpacity={0.02}
              areaChart
              hideRules
              disableScroll
              yAxisColor="transparent"
              xAxisColor={BORDER_COLOR}
              yAxisTextStyle={{ color: MUTED_COLOR, fontSize: 11 }}
              xAxisLabelTextStyle={{ color: MUTED_COLOR, fontSize: 11 }}
              noOfSections={4}
            />

            <View
              testID="exercise-history-interaction-layer"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: CHART_HEIGHT,
              }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={handleTouch}
              onResponderMove={handleTouch}
              onResponderRelease={() => setActiveIndex(null)}
              {...webHoverProps}
            />

            {activeIndex !== null && activePoint && activePosition ? (
              <>
                <View
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    left: activePosition.x,
                    top: 0,
                    width: 1,
                    height: CHART_HEIGHT,
                    backgroundColor: BORDER_COLOR,
                  }}
                />
                <View
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    left: activePosition.x - 4,
                    top: activePosition.y - 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: CHART_COLOR,
                  }}
                />
                <View
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    left: activePosition.x - TOOLTIP_WIDTH / 2,
                    top: Math.max(0, activePosition.y - TOOLTIP_HEIGHT - TOOLTIP_GAP),
                    width: TOOLTIP_WIDTH,
                    zIndex: 20,
                  }}>
                  <MetricTooltip
                    metric={metric}
                    value={activePoint.value}
                    label={activePoint.label}
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}
