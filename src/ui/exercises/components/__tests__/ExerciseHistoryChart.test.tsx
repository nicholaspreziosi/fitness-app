import {
  ExerciseHistoryChart,
  formatMetricTooltipValue,
  getActiveIndexFromX,
  getPointPosition,
} from '@/src/ui/exercises/components/ExerciseHistoryChart';
import type { ExercisePerformancePoint } from '@/src/contexts/workouts/domain/exercisePerformanceHistory';
import { createTestDate } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('react-native-gifted-charts', () => {
  const React = require('react');
  const { View: RNView } = require('react-native');

  return {
    LineChart: ({ data }: { data: Array<{ value: number; label?: string }> }) => (
      <RNView testID="exercise-history-line-chart" accessibilityLabel={`points-${data.length}`} />
    ),
  };
});

const history: ExercisePerformancePoint[] = [
  {
    workoutId: 'workout-1',
    date: createTestDate(0),
    weight: 90,
    reps: 8,
    sets: 2,
  },
  {
    workoutId: 'workout-2',
    date: createTestDate(7),
    weight: 100,
    reps: 10,
    sets: 3,
  },
];

describe('ExerciseHistoryChart', () => {
  it('shows empty state when selected metric has no points', () => {
    render(
      <ExerciseHistoryChart
        history={[
          {
            workoutId: 'workout-1',
            date: createTestDate(0),
            weight: 100,
          },
        ]}
      />
    );

    fireEvent.press(screen.getByTestId('exercise-history-metric-holdSeconds'));

    expect(
      screen.getByText('Complete workouts with logged hold to see history.')
    ).toBeTruthy();
    expect(screen.queryByTestId('exercise-history-line-chart')).toBeNull();
  });

  it('renders chart when selected metric has data', () => {
    render(<ExerciseHistoryChart history={history} />);

    expect(screen.getByTestId('exercise-history-line-chart')).toBeTruthy();
    expect(screen.getByLabelText('points-2')).toBeTruthy();
  });

  it('switches metric via segmented control', () => {
    render(<ExerciseHistoryChart history={history} />);

    fireEvent.press(screen.getByTestId('exercise-history-metric-reps'));

    expect(screen.getByTestId('exercise-history-line-chart')).toBeTruthy();
    expect(screen.getByLabelText('points-2')).toBeTruthy();

    fireEvent.press(screen.getByTestId('exercise-history-metric-holdSeconds'));

    expect(
      screen.getByText('Complete workouts with logged hold to see history.')
    ).toBeTruthy();
  });

  it('defaults to the first metric that has data', () => {
    render(
      <ExerciseHistoryChart
        history={[
          {
            workoutId: 'workout-1',
            date: createTestDate(0),
            holdSeconds: 45,
          },
        ]}
      />
    );

    expect(screen.getByTestId('exercise-history-line-chart')).toBeTruthy();
    expect(screen.queryByText(/logged hold/)).toBeNull();
  });

  it('shows empty state when history is empty', () => {
    render(<ExerciseHistoryChart history={[]} />);

    expect(
      screen.getByText('Complete workouts with logged weight to see history.')
    ).toBeTruthy();
  });

  it('shows a tooltip on touch over the chart', () => {
    render(<ExerciseHistoryChart history={history} />);

    expect(screen.queryByTestId('exercise-history-tooltip')).toBeNull();

    fireEvent(screen.getByTestId('exercise-history-interaction-layer'), 'responderGrant', {
      nativeEvent: { locationX: 60 },
    });

    expect(screen.getByTestId('exercise-history-tooltip')).toBeTruthy();
    expect(screen.getByText('90 lbs')).toBeTruthy();

    fireEvent(screen.getByTestId('exercise-history-interaction-layer'), 'responderRelease');

    expect(screen.queryByTestId('exercise-history-tooltip')).toBeNull();
  });

  it('formats tooltip values by metric', () => {
    expect(formatMetricTooltipValue('weight', 100)).toBe('100 lbs');
    expect(formatMetricTooltipValue('reps', 8)).toBe('8');
    expect(formatMetricTooltipValue('sets', 3)).toBe('3');
    expect(formatMetricTooltipValue('holdSeconds', 45)).toBe('45s');
  });

  it('maps pointer x to the nearest point index', () => {
    expect(
      getActiveIndexFromX({
        locationX: 60,
        pointCount: 3,
        spacing: 50,
        yAxisLabelWidth: 40,
        initialSpacing: 20,
      })
    ).toBe(0);

    expect(
      getActiveIndexFromX({
        locationX: 110,
        pointCount: 3,
        spacing: 50,
        yAxisLabelWidth: 40,
        initialSpacing: 20,
      })
    ).toBe(1);
  });

  it('positions points for tooltip alignment', () => {
    expect(
      getPointPosition({
        index: 1,
        value: 8,
        maxValue: 10,
        spacing: 50,
        chartHeight: 200,
        yAxisLabelWidth: 40,
        initialSpacing: 20,
      })
    ).toEqual({ x: 110, y: 40 });
  });
});
