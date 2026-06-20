import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import { createMockWorkout } from '@/test-utils/mockData';
import { act, renderHook } from '@testing-library/react-native';

import { useWorkoutSession } from '../useWorkoutSession';

const mockStartMutateAsync = jest.fn();
const mockResumeMutateAsync = jest.fn();
const mockExitMutateAsync = jest.fn();
const mockCompleteMutateAsync = jest.fn();
const mockSkipMutateAsync = jest.fn();

jest.mock('../useWorkoutMutations', () => ({
  useWorkoutMutations: () => ({
    startWorkout: { mutateAsync: mockStartMutateAsync },
    resumeWorkout: { mutateAsync: mockResumeMutateAsync },
    exitWorkout: { mutateAsync: mockExitMutateAsync },
    completeWorkout: { mutateAsync: mockCompleteMutateAsync },
    skipWorkout: { mutateAsync: mockSkipMutateAsync },
    isReady: true,
  }),
}));

jest.mock('@/src/contexts/workouts/application/createWorkoutService', () => ({
  createWorkoutService: jest.fn(),
}));

describe('useWorkoutSession', () => {
  const onNavigateToMode = jest.fn();
  const onNavigateToList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockStartMutateAsync.mockResolvedValue(createMockWorkout({ id: 'workout-1', status: 'inProgress' }));
    mockResumeMutateAsync.mockResolvedValue(createMockWorkout({ id: 'workout-1', status: 'inProgress' }));
    mockExitMutateAsync.mockResolvedValue(createMockWorkout({ id: 'workout-1', status: 'inProgress' }));
    mockCompleteMutateAsync.mockResolvedValue(createMockWorkout({ id: 'workout-1', status: 'completed' }));
    mockSkipMutateAsync.mockResolvedValue(createMockWorkout({ id: 'workout-1', status: 'skipped' }));
  });

  it('starts workout and navigates to mode', async () => {
    const { result } = renderHook(() =>
      useWorkoutSession({ onNavigateToMode, onNavigateToList })
    );

    await act(async () => {
      await result.current.start('workout-1');
    });

    expect(mockStartMutateAsync).toHaveBeenCalledWith('workout-1');
    expect(onNavigateToMode).toHaveBeenCalledWith('workout-1');
  });

  it('resumes workout and navigates to mode', async () => {
    const { result } = renderHook(() =>
      useWorkoutSession({ onNavigateToMode, onNavigateToList })
    );

    await act(async () => {
      await result.current.resume('workout-1');
    });

    expect(mockResumeMutateAsync).toHaveBeenCalledWith('workout-1');
    expect(onNavigateToMode).toHaveBeenCalledWith('workout-1');
  });

  it('exits workout and navigates to list', async () => {
    const { result } = renderHook(() =>
      useWorkoutSession({ onNavigateToMode, onNavigateToList })
    );

    await act(async () => {
      await result.current.exit('workout-1');
    });

    expect(mockExitMutateAsync).toHaveBeenCalledWith('workout-1');
    expect(onNavigateToList).toHaveBeenCalled();
  });

  it('finishes workout and returns completed workout', async () => {
    const { result } = renderHook(() =>
      useWorkoutSession({ onNavigateToMode, onNavigateToList })
    );

    let completed;
    await act(async () => {
      completed = await result.current.finish('workout-1');
    });

    expect(mockCompleteMutateAsync).toHaveBeenCalledWith('workout-1');
    expect(completed?.status).toBe('completed');
  });

  it('skips workout and navigates to list', async () => {
    const { result } = renderHook(() =>
      useWorkoutSession({ onNavigateToMode, onNavigateToList })
    );

    await act(async () => {
      await result.current.skip('workout-1');
    });

    expect(mockSkipMutateAsync).toHaveBeenCalledWith('workout-1');
    expect(onNavigateToList).toHaveBeenCalled();
  });
});
