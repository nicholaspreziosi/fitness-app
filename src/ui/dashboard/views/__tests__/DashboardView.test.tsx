import type { DashboardViewMode } from '@/src/contexts/dashboard/domain/dashboard.types';
import { useDashboardSummary } from '@/src/ui/dashboard/hooks/useDashboardSummary';
import { DashboardView } from '@/src/ui/dashboard/views/DashboardView';
import { useHorizontalSwipeWithScrollGesture } from '@/src/ui/shared/hooks/useHorizontalSwipeWithScrollGesture';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

jest.mock('@/src/ui/dashboard/hooks/useDashboardSummary', () => ({
  useDashboardSummary: jest.fn(),
}));

jest.mock('@/src/ui/shared/hooks/useHorizontalSwipeWithScrollGesture', () => ({
  useHorizontalSwipeWithScrollGesture: jest.fn(() => ({ type: 'dashboard-swipe-gesture' })),
}));

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({
      children,
      scrollGesture,
    }: {
      children: React.ReactNode;
      scrollGesture?: unknown;
    }) => (
      <View testID={scrollGesture ? 'screen-with-swipe' : 'screen'}>{children}</View>
    ),
  };
});

jest.mock('@/src/ui/workouts/components/WeekNavigator', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    WeekNavigator: ({
      onPreviousWeek,
      onNextWeek,
      onOpenWeekPicker,
    }: {
      onPreviousWeek: () => void;
      onNextWeek: () => void;
      onOpenWeekPicker: () => void;
    }) => (
      <View testID="week-navigator">
        <Pressable testID="week-navigator-previous" onPress={onPreviousWeek} />
        <Pressable testID="week-navigator-label" onPress={onOpenWeekPicker}>
          <Text>Jun 10 - 16</Text>
        </Pressable>
        <Pressable testID="week-navigator-next" onPress={onNextWeek} />
      </View>
    ),
  };
});

jest.mock('@/src/ui/shared/components/MonthNavigator', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    MonthNavigator: ({
      onPreviousMonth,
      onNextMonth,
      onOpenMonthPicker,
    }: {
      onPreviousMonth: () => void;
      onNextMonth: () => void;
      onOpenMonthPicker: () => void;
    }) => (
      <View testID="month-navigator">
        <Pressable testID="month-navigator-previous" onPress={onPreviousMonth} />
        <Pressable testID="month-navigator-label" onPress={onOpenMonthPicker}>
          <Text>June 2024</Text>
        </Pressable>
        <Pressable testID="month-navigator-next" onPress={onNextMonth} />
      </View>
    ),
  };
});

const useDashboardSummaryMock = jest.mocked(useDashboardSummary);
const useHorizontalSwipeWithScrollGestureMock = jest.mocked(useHorizontalSwipeWithScrollGesture);

function createSummary(overrides: Partial<ReturnType<typeof useDashboardSummary>['summary']> = {}) {
  return {
    viewMode: 'week' as DashboardViewMode,
    rangeLabel: 'Jun 10 - 16',
    workoutStats: { completed: 1, total: 2 },
    exerciseStats: { completed: 3, total: 4 },
    completionPercentage: 75,
    coverage: [{ bodyPart: 'Core', count: 2 }],
    upcoming: [createMockWorkout({ id: 'upcoming-1', name: 'Lower Body', date: createTestDate(1) })],
    emptyStates: {
      noWorkouts: false,
      noCompletedData: false,
      noUpcoming: false,
      noChartData: false,
    },
    ...overrides,
  };
}

describe('DashboardView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDashboardSummaryMock.mockReturnValue({
      summary: createSummary(),
      workouts: [],
      rangeStart: createTestDate(-5),
      rangeEnd: createTestDate(1),
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('renders page header, view mode filter, week navigator, stat cards, charts, and upcoming workouts', () => {
    render(<DashboardView />);

    expect(screen.getByTestId('screen-with-swipe')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Track training consistency and coverage.')).toBeTruthy();
    expect(screen.getByTestId('dashboard-view-mode-filter')).toBeTruthy();
    expect(screen.getByTestId('week-navigator')).toBeTruthy();
    expect(screen.getByText('1 / 2')).toBeTruthy();
    expect(screen.getByText('3 / 4')).toBeTruthy();
    expect(screen.getByTestId('completion-donut-chart')).toBeTruthy();
    expect(screen.getByTestId('coverage-bar-chart')).toBeTruthy();
    expect(screen.getByText('Upcoming')).toBeTruthy();
    expect(screen.getByText('Lower Body')).toBeTruthy();
  });

  it('defaults to week view with the current anchor date', () => {
    render(<DashboardView />);

    expect(useDashboardSummaryMock).toHaveBeenCalledWith('week', expect.objectContaining({
      anchorDate: expect.any(Date),
    }));
  });

  it('updates dashboard data when the view mode changes to month', () => {
    render(<DashboardView />);

    fireEvent.press(screen.getByTestId('dashboard-view-mode-filter-month'));

    expect(useDashboardSummaryMock).toHaveBeenLastCalledWith('month', expect.objectContaining({
      anchorDate: expect.any(Date),
    }));
    expect(screen.getByTestId('month-navigator')).toBeTruthy();
  });

  it('wires horizontal swipe navigation to the dashboard date range', () => {
    render(<DashboardView />);

    expect(useHorizontalSwipeWithScrollGestureMock).toHaveBeenCalledWith({
      onSwipePrevious: expect.any(Function),
      onSwipeNext: expect.any(Function),
    });
  });

  it('updates dashboard data when navigating to another week', () => {
    render(<DashboardView />);

    fireEvent.press(screen.getByTestId('week-navigator-next'));

    expect(useDashboardSummaryMock).toHaveBeenLastCalledWith('week', expect.objectContaining({
      anchorDate: expect.any(Date),
    }));
  });

  it('shows loading state', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary: createSummary(),
      workouts: [],
      rangeStart: createTestDate(-5),
      rangeEnd: createTestDate(1),
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<DashboardView />);

    expect(screen.getByLabelText('loading')).toBeTruthy();
  });

  it('shows no-workouts empty state', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary: createSummary({
        emptyStates: {
          noWorkouts: true,
          noCompletedData: true,
          noUpcoming: true,
          noChartData: true,
        },
        upcoming: [],
        coverage: [],
        workoutStats: { completed: 0, total: 0 },
        exerciseStats: { completed: 0, total: 0 },
        completionPercentage: 0,
      }),
      workouts: [],
      rangeStart: createTestDate(-5),
      rangeEnd: createTestDate(1),
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<DashboardView />);

    expect(screen.getByText('No workouts planned for this period.')).toBeTruthy();
  });

  it('shows no-completed-data empty state', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary: createSummary({
        emptyStates: {
          noWorkouts: false,
          noCompletedData: true,
          noUpcoming: false,
          noChartData: true,
        },
        workoutStats: { completed: 0, total: 2 },
      }),
      workouts: [],
      rangeStart: createTestDate(-5),
      rangeEnd: createTestDate(1),
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<DashboardView />);

    expect(screen.getByText('No completed workouts yet.')).toBeTruthy();
  });

  it('shows no-upcoming-workouts empty state', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary: createSummary({
        upcoming: [],
        emptyStates: {
          noWorkouts: false,
          noCompletedData: false,
          noUpcoming: true,
          noChartData: false,
        },
      }),
      workouts: [],
      rangeStart: createTestDate(-5),
      rangeEnd: createTestDate(1),
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<DashboardView />);

    expect(screen.getByText('No upcoming workouts for this period.')).toBeTruthy();
  });

  it('shows no-chart-data empty state', () => {
    useDashboardSummaryMock.mockReturnValue({
      summary: createSummary({
        coverage: [],
        emptyStates: {
          noWorkouts: false,
          noCompletedData: false,
          noUpcoming: false,
          noChartData: true,
        },
      }),
      workouts: [],
      rangeStart: createTestDate(-5),
      rangeEnd: createTestDate(1),
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<DashboardView />);

    expect(screen.getAllByText('Complete workouts to see training coverage.')).toHaveLength(2);
  });
});
