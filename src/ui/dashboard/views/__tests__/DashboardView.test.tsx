import type { DashboardPeriod } from '@/src/contexts/dashboard/domain/dashboard.types';
import { useDashboardSummary } from '@/src/ui/dashboard/hooks/useDashboardSummary';
import { DashboardView } from '@/src/ui/dashboard/views/DashboardView';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

jest.mock('@/src/ui/dashboard/hooks/useDashboardSummary', () => ({
  useDashboardSummary: jest.fn(),
}));

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

const useDashboardSummaryMock = jest.mocked(useDashboardSummary);

function createSummary(overrides: Partial<ReturnType<typeof useDashboardSummary>['summary']> = {}) {
  return {
    period: 'thisWeek' as DashboardPeriod,
    periodLabel: 'This Week',
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

  it('renders page header, filter, stat cards, charts, and upcoming workouts', () => {
    render(<DashboardView />);

    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Track training consistency and coverage.')).toBeTruthy();
    expect(screen.getByTestId('dashboard-period-filter')).toBeTruthy();
    expect(screen.getByText('1 / 2')).toBeTruthy();
    expect(screen.getByText('3 / 4')).toBeTruthy();
    expect(screen.getByTestId('completion-donut-chart')).toBeTruthy();
    expect(screen.getByTestId('coverage-bar-chart')).toBeTruthy();
    expect(screen.getByText('Upcoming')).toBeTruthy();
    expect(screen.getByText('Lower Body')).toBeTruthy();
  });

  it('defaults to this week', () => {
    render(<DashboardView />);

    expect(useDashboardSummaryMock).toHaveBeenCalledWith('thisWeek');
  });

  it('updates dashboard data when the period filter changes', () => {
    render(<DashboardView />);

    fireEvent.press(screen.getByTestId('dashboard-period-filter-nextWeek'));

    expect(useDashboardSummaryMock).toHaveBeenLastCalledWith('nextWeek');
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
