import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import { getPeriodRange } from '@/src/contexts/dashboard/domain/dashboardPeriod';
import { dashboardQueryKeys } from '@/src/ui/dashboard/hooks/dashboardQueryKeys';
import { useDashboardWorkouts } from '@/src/ui/dashboard/hooks/useDashboardWorkouts';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

const mockListWorkoutsByDateRange = jest.fn();

jest.mock('@/src/contexts/workouts/application/createWorkoutService', () => ({
  createWorkoutService: jest.fn(),
}));

jest.mock('@/src/ui/shared/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

const createWorkoutServiceMock = createWorkoutService as jest.MockedFunction<
  typeof createWorkoutService
>;

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useDashboardWorkouts', () => {
  let queryClient: QueryClient;
  const referenceDate = FIXED_DATE;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    createWorkoutServiceMock.mockReturnValue({
      listWorkoutsByDateRange: mockListWorkoutsByDateRange,
    } as unknown as ReturnType<typeof createWorkoutService>);
    mockListWorkoutsByDateRange.mockResolvedValue([createMockWorkout()]);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('fetches workouts for the selected period range', async () => {
    const { start, end } = getPeriodRange('thisWeek', referenceDate);

    const { result } = renderHook(
      () => useDashboardWorkouts('thisWeek', { referenceDate }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(1);
    });

    expect(mockListWorkoutsByDateRange).toHaveBeenCalledWith(start, end);
    expect(result.current.rangeStart).toEqual(start);
    expect(result.current.rangeEnd).toEqual(end);
  });

  it('uses period-specific query keys', async () => {
    const { start } = getPeriodRange('nextWeek', referenceDate);
    const expectedKey = dashboardQueryKeys('user-1').period('nextWeek', start.toISOString());

    renderHook(() => useDashboardWorkouts('nextWeek', { referenceDate }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(expectedKey)).toBeDefined();
    });
  });

  it('updates when the period changes', async () => {
    const thisWeekRange = getPeriodRange('thisWeek', referenceDate);
    const nextWeekRange = getPeriodRange('nextWeek', referenceDate);

    const { rerender } = renderHook(
      ({ period }: { period: 'thisWeek' | 'nextWeek' }) =>
        useDashboardWorkouts(period, { referenceDate }),
      {
        wrapper: createWrapper(queryClient),
        initialProps: { period: 'thisWeek' as const },
      }
    );

    await waitFor(() => {
      expect(mockListWorkoutsByDateRange).toHaveBeenCalledWith(
        thisWeekRange.start,
        thisWeekRange.end
      );
    });

    rerender({ period: 'nextWeek' });

    await waitFor(() => {
      expect(mockListWorkoutsByDateRange).toHaveBeenCalledWith(
        nextWeekRange.start,
        nextWeekRange.end
      );
    });
  });
});
