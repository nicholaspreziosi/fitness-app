import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as React from 'react';

import { useWorkoutAutoSave } from '../useWorkoutAutoSave';

const mockUpdateWorkoutExercise = jest.fn();

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

describe('useWorkoutAutoSave', () => {
  const userId = 'user-1';
  const weekStartIso = createTestDate().toISOString();
  const weekKey = workoutQueryKeys(userId).week(weekStartIso);
  const baseWorkout = createMockWorkout({
    id: 'workout-1',
    status: 'inProgress',
    exercises: [
      createMockWorkoutExercise({
        id: 'we-1',
        actualReps: 8,
        completed: false,
      }),
    ],
  });

  let queryClient: QueryClient;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData<Workout[]>(weekKey, [baseWorkout]);
    createWorkoutServiceMock.mockReturnValue({
      updateWorkoutExercise: mockUpdateWorkoutExercise,
    } as unknown as ReturnType<typeof createWorkoutService>);
    mockUpdateWorkoutExercise.mockImplementation(async (_workoutId, _exerciseId, patch) => ({
      ...baseWorkout,
      exercises: [{ ...baseWorkout.exercises[0]!, ...patch }],
    }));
  });

  afterEach(() => {
    queryClient.clear();
    jest.useRealTimers();
  });

  it('debounces field updates before saving', async () => {
    const { result } = renderHook(
      () =>
        useWorkoutAutoSave({
          workout: baseWorkout,
          weekQueryKey: weekKey,
        }),
      { wrapper: createWrapper(queryClient) }
    );

    act(() => {
      result.current.saveExerciseChange('we-1', { actualReps: 9 });
      result.current.saveExerciseChange('we-1', { actualReps: 10 });
    });

    expect(mockUpdateWorkoutExercise).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(400);
      await Promise.resolve();
    });

    expect(mockUpdateWorkoutExercise).toHaveBeenCalledTimes(1);
    expect(mockUpdateWorkoutExercise).toHaveBeenCalledWith('workout-1', 'we-1', {
      actualReps: 10,
    });
  });

  it('optimistically updates cached workout data immediately', () => {
    const { result } = renderHook(
      () =>
        useWorkoutAutoSave({
          workout: baseWorkout,
          weekQueryKey: weekKey,
        }),
      { wrapper: createWrapper(queryClient) }
    );

    act(() => {
      result.current.saveExerciseChange('we-1', { actualReps: 10 });
    });

    const cached = queryClient.getQueryData<Workout[]>(weekKey)?.[0]?.exercises[0];
    expect(cached?.actualReps).toBe(10);
  });

  it('saves completed state immediately without debounce', async () => {
    const { result } = renderHook(
      () =>
        useWorkoutAutoSave({
          workout: baseWorkout,
          weekQueryKey: weekKey,
        }),
      { wrapper: createWrapper(queryClient) }
    );

    await act(async () => {
      await result.current.saveExerciseChange('we-1', { completed: true });
    });

    expect(mockUpdateWorkoutExercise).toHaveBeenCalledWith('workout-1', 'we-1', {
      completed: true,
    });
  });

  it('rolls back optimistic updates when save fails', async () => {
    mockUpdateWorkoutExercise.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(
      () =>
        useWorkoutAutoSave({
          workout: baseWorkout,
          weekQueryKey: weekKey,
        }),
      { wrapper: createWrapper(queryClient) }
    );

    await act(async () => {
      await result.current.saveExerciseChange('we-1', { completed: true });
    });

    expect(result.current.saveStatus).toBe('error');
    expect(queryClient.getQueryData<Workout[]>(weekKey)?.[0]?.exercises[0]?.completed).toBe(false);
  });
});
