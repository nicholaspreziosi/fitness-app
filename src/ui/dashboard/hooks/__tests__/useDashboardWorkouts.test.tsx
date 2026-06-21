import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import { getDashboardRange } from '@/src/contexts/dashboard/domain/dashboardPeriod';
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

jest.mock('@/src/ui/profile/hooks/useWeekStartDay', () => ({
  useWeekStartDay: () => 1,
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
  const anchorDate = FIXED_DATE;

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

  it('fetches workouts for the selected week range', async () => {
    const { start, end } = getDashboardRange('week', anchorDate, 1);

    const { result } = renderHook(() => useDashboardWorkouts('week', { anchorDate }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(1);
    });

    expect(mockListWorkoutsByDateRange).toHaveBeenCalledWith(start, end);
    expect(result.current.rangeStart).toEqual(start);
    expect(result.current.rangeEnd).toEqual(end);
  });

  it('fetches workouts for the selected month range', async () => {
    const { start, end } = getDashboardRange('month', anchorDate, 1);

    const { result } = renderHook(() => useDashboardWorkouts('month', { anchorDate }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(1);
    });

    expect(mockListWorkoutsByDateRange).toHaveBeenCalledWith(start, end);
  });

  it('uses view-mode-specific query keys', async () => {
    const { start } = getDashboardRange('week', anchorDate, 1);
    const expectedKey = dashboardQueryKeys('user-1').viewMode('week', start.toISOString());

    renderHook(() => useDashboardWorkouts('week', { anchorDate }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(expectedKey)).toBeDefined();
    });
  });

  it('updates when the anchor date changes', async () => {
    const thisWeekRange = getDashboardRange('week', anchorDate, 1);
    const nextWeekRange = getDashboardRange('week', createTestDate(7), 1);

    const { rerender } = renderHook(
      ({ date }: { date: Date }) => useDashboardWorkouts('week', { anchorDate: date }),
      {
        wrapper: createWrapper(queryClient),
        initialProps: { date: anchorDate },
      }
    );

    await waitFor(() => {
      expect(mockListWorkoutsByDateRange).toHaveBeenCalledWith(
        thisWeekRange.start,
        thisWeekRange.end
      );
    });

    rerender({ date: createTestDate(7) });

    await waitFor(() => {
      expect(mockListWorkoutsByDateRange).toHaveBeenCalledWith(
        nextWeekRange.start,
        nextWeekRange.end
      );
    });
  });
});
