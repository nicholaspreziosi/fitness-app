import { createExerciseService } from '@/src/contexts/exercises/application/createExerciseService';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import { exerciseQueryKeys } from '@/src/ui/exercises/hooks/exerciseQueryKeys';
import { useToggleExerciseFavorite } from '@/src/ui/exercises/hooks/useToggleExerciseFavorite';
import { createMockExercise } from '@/test-utils/mockData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

const mockFavoriteExercise = jest.fn();
const mockUnfavoriteExercise = jest.fn();

jest.mock('@/src/contexts/exercises/application/createExerciseService', () => ({
  createExerciseService: jest.fn(),
}));

jest.mock('@/src/ui/shared/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

const createExerciseServiceMock = createExerciseService as jest.MockedFunction<
  typeof createExerciseService
>;

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useToggleExerciseFavorite', () => {
  const userId = 'user-1';
  const keys = exerciseQueryKeys(userId);
  const exercise = createMockExercise({ id: 'exercise-1', favorite: false });
  let queryClient: QueryClient;

  afterEach(() => {
    queryClient?.clear();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    createExerciseServiceMock.mockReturnValue({
      favoriteExercise: mockFavoriteExercise,
      unfavoriteExercise: mockUnfavoriteExercise,
    } as unknown as ReturnType<typeof createExerciseService>);
    mockFavoriteExercise.mockResolvedValue(undefined);
    mockUnfavoriteExercise.mockResolvedValue(undefined);
  });

  it('optimistically updates list and detail caches', async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    queryClient.setQueryData<Exercise[]>(keys.all, [exercise]);
    queryClient.setQueryData<Exercise>(keys.detail(exercise.id), exercise);

    const { result } = renderHook(() => useToggleExerciseFavorite(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.toggleFavorite(exercise.id, false);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData<Exercise[]>(keys.all)?.[0]?.favorite).toBe(true);
      expect(queryClient.getQueryData<Exercise>(keys.detail(exercise.id))?.favorite).toBe(true);
    });

    await waitFor(() => {
      expect(mockFavoriteExercise).toHaveBeenCalledWith(exercise.id);
    });
  });

  it('rolls back caches when the mutation fails', async () => {
    mockFavoriteExercise.mockRejectedValueOnce(new Error('Network error'));

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    queryClient.setQueryData<Exercise[]>(keys.all, [exercise]);
    queryClient.setQueryData<Exercise>(keys.detail(exercise.id), exercise);

    const { result } = renderHook(() => useToggleExerciseFavorite(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.toggleFavorite(exercise.id, false);
      await waitFor(() => {
        expect(queryClient.getQueryData<Exercise[]>(keys.all)?.[0]?.favorite).toBe(false);
      });
    });

    expect(queryClient.getQueryData<Exercise>(keys.detail(exercise.id))?.favorite).toBe(false);
  });
});
