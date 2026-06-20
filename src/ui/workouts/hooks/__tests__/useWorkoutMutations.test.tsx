import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { useWorkoutMutations } from '../useWorkoutMutations';

const mockCompleteWorkout = jest.fn();
const mockDeleteWorkout = jest.fn();
const mockExitWorkout = jest.fn();
const mockRevertWorkoutToPlanned = jest.fn();
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

describe('useWorkoutMutations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    createWorkoutServiceMock.mockReturnValue({
      completeWorkout: mockCompleteWorkout,
      deleteWorkout: mockDeleteWorkout,
      exitWorkout: mockExitWorkout,
      revertWorkoutToPlanned: mockRevertWorkoutToPlanned,
      updateWorkoutExercise: mockUpdateWorkoutExercise,
    } as unknown as ReturnType<typeof createWorkoutService>);
    mockCompleteWorkout.mockResolvedValue({ id: 'workout-1', status: 'completed' });
    mockExitWorkout.mockResolvedValue({ id: 'workout-1', status: 'inProgress' });
    mockUpdateWorkoutExercise.mockResolvedValue({ id: 'workout-1' });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('calls completeWorkout and invalidates workout queries', async () => {
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useWorkoutMutations(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.completeWorkout.mutateAsync('workout-1');
    });

    await waitFor(() => {
      expect(result.current.completeWorkout.isSuccess).toBe(true);
    });

    expect(mockCompleteWorkout).toHaveBeenCalledWith('workout-1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: workoutQueryKeys('user-1').all,
    });
  });

  it('calls exitWorkout and invalidates workout queries', async () => {
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useWorkoutMutations(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.exitWorkout.mutateAsync('workout-1');
    });

    expect(mockExitWorkout).toHaveBeenCalledWith('workout-1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: workoutQueryKeys('user-1').all,
    });
  });

  it('calls deleteWorkout and invalidates workout queries', async () => {
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useWorkoutMutations(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.deleteWorkout.mutateAsync('workout-1');
    });

    expect(mockDeleteWorkout).toHaveBeenCalledWith('workout-1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: workoutQueryKeys('user-1').all,
    });
  });

  it('calls revertWorkoutToPlanned and invalidates workout queries', async () => {
    mockRevertWorkoutToPlanned.mockResolvedValue({ id: 'workout-1', status: 'planned' });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useWorkoutMutations(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.revertWorkoutToPlanned.mutateAsync('workout-1');
    });

    expect(mockRevertWorkoutToPlanned).toHaveBeenCalledWith('workout-1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: workoutQueryKeys('user-1').all,
    });
  });

  it('calls updateWorkoutExercise with patch and invalidates workout queries', async () => {
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const patch = { completed: true, actualSets: 3 };

    const { result } = renderHook(() => useWorkoutMutations(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.updateWorkoutExercise.mutateAsync({
        workoutId: 'workout-1',
        workoutExerciseId: 'we-1',
        patch,
      });
    });

    expect(mockUpdateWorkoutExercise).toHaveBeenCalledWith('workout-1', 'we-1', patch);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: workoutQueryKeys('user-1').all,
    });
  });
});
