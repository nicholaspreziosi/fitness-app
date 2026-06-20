jest.mock('@/src/ui/dashboard/hooks/useDashboardWorkouts', () => ({
  useDashboardWorkouts: jest.fn(),
}));

import { createDashboardService } from '@/src/contexts/dashboard/application/createDashboardService';
import { useDashboardSummary } from '@/src/ui/dashboard/hooks/useDashboardSummary';
import { useDashboardWorkouts } from '@/src/ui/dashboard/hooks/useDashboardWorkouts';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';
import { renderHook } from '@testing-library/react-native';

const useDashboardWorkoutsMock = jest.mocked(useDashboardWorkouts);

describe('useDashboardSummary', () => {
  const referenceDate = FIXED_DATE;
  const workouts = [
    createMockWorkout({
      status: 'completed',
      date: createTestDate(0),
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useDashboardWorkoutsMock.mockReturnValue({
      workouts,
      rangeStart: createTestDate(-5),
      rangeEnd: createTestDate(1),
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('derives summary from fetched workouts', () => {
    const service = createDashboardService();
    const expected = service.getDashboardSummary(workouts, 'thisWeek', referenceDate);

    const { result } = renderHook(() =>
      useDashboardSummary('thisWeek', { referenceDate })
    );

    expect(result.current.summary).toEqual(expected);
  });

  it('passes through loading and error state', () => {
    useDashboardWorkoutsMock.mockReturnValue({
      workouts: [],
      rangeStart: createTestDate(-5),
      rangeEnd: createTestDate(1),
      isLoading: true,
      isError: true,
      error: new Error('Unable to load workouts.'),
      refetch: jest.fn(),
    });

    const { result } = renderHook(() =>
      useDashboardSummary('thisWeek', { referenceDate })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(new Error('Unable to load workouts.'));
  });
});
