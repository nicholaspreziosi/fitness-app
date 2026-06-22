import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { useWorkoutMutations } from '../useWorkoutMutations';

const mockCompleteWorkout = jest.fn();
const mockDeleteWorkout = jest.fn();
const mockExitWorkout = jest.fn();
const mockMoveExerciseToWorkout = jest.fn();
const mockReorderWorkoutExercises = jest.fn();
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
      moveExerciseToWorkout: mockMoveExerciseToWorkout,
      reorderWorkoutExercises: mockReorderWorkoutExercises,
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

  it('optimistically reorders exercises and rolls back on failure', async () => {
    const weekStartIso = createTestDate().toISOString();
    const weekKey = workoutQueryKeys('user-1').week(weekStartIso);
    const workout = createMockWorkout({
      id: 'workout-1',
      exercises: [
        createMockWorkoutExercise({ id: 'we-1', sortOrder: 0 }),
        createMockWorkoutExercise({ id: 'we-2', sortOrder: 1 }),
      ],
    });
    queryClient.setQueryData<Workout[]>(weekKey, [workout]);
    mockReorderWorkoutExercises.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useWorkoutMutations(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      try {
        await result.current.reorderExercises.mutateAsync({
          workoutId: 'workout-1',
          orderedIds: ['we-2', 'we-1'],
        });
      } catch {
        // expected
      }
    });

    expect(queryClient.getQueryData<Workout[]>(weekKey)?.[0]?.exercises.map((e) => e.id)).toEqual([
      'we-1',
      'we-2',
    ]);
  });

  it('optimistically updates exercise order in cached workouts', async () => {
    const weekStartIso = createTestDate().toISOString();
    const weekKey = workoutQueryKeys('user-1').week(weekStartIso);
    const workout = createMockWorkout({
      id: 'workout-1',
      exercises: [
        createMockWorkoutExercise({ id: 'we-1', sortOrder: 0 }),
        createMockWorkoutExercise({ id: 'we-2', sortOrder: 1 }),
      ],
    });
    queryClient.setQueryData<Workout[]>(weekKey, [workout]);
    mockReorderWorkoutExercises.mockResolvedValueOnce({
      ...workout,
      exercises: [
        { ...workout.exercises[1]!, sortOrder: 0 },
        { ...workout.exercises[0]!, sortOrder: 1 },
      ],
    });

    const { result } = renderHook(() => useWorkoutMutations(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.reorderExercises.mutateAsync({
        workoutId: 'workout-1',
        orderedIds: ['we-2', 'we-1'],
      });
    });

    expect(queryClient.getQueryData<Workout[]>(weekKey)?.[0]?.exercises.map((e) => e.id)).toEqual([
      'we-2',
      'we-1',
    ]);
  });
});
