import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useExerciseHistory } from '@/src/ui/exercises/hooks/useExerciseHistory';
import { createTestDate } from '@/test-utils/testDates';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

const mockGetExercisePerformanceHistory = jest.fn();

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

describe('useExerciseHistory', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    createWorkoutServiceMock.mockReturnValue({
      getExercisePerformanceHistory: mockGetExercisePerformanceHistory,
    } as unknown as ReturnType<typeof createWorkoutService>);
    mockGetExercisePerformanceHistory.mockResolvedValue([
      {
        workoutId: 'workout-1',
        date: createTestDate(0),
        weight: 100,
        reps: 8,
      },
    ]);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('fetches exercise performance history via workout service', async () => {
    const { result } = renderHook(() => useExerciseHistory('exercise-1'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    expect(createWorkoutServiceMock).toHaveBeenCalledWith('user-1');
    expect(mockGetExercisePerformanceHistory).toHaveBeenCalledWith('exercise-1');
    expect(result.current.history?.[0]).toMatchObject({
      workoutId: 'workout-1',
      weight: 100,
      reps: 8,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('uses the exercise history query key', async () => {
    const { result } = renderHook(() => useExerciseHistory('exercise-1'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    const cached = queryClient.getQueryData(
      exerciseQueryKeys('user-1').history('exercise-1')
    );
    expect(cached).toHaveLength(1);
  });
});
