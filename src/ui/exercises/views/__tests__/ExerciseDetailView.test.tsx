import { ExerciseDetailView } from '@/src/ui/exercises/views/ExerciseDetailView';
import { createMockExercise } from '@/test-utils/mockData';
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockPush = jest.fn();

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useLocalSearchParams: () => ({ id: 'exercise-1' }),
}));

jest.mock('@/src/ui/exercises/hooks/useExercise', () => ({
  useExercise: jest.fn(),
}));

jest.mock('@/src/ui/exercises/hooks/useToggleExerciseFavorite', () => ({
  useToggleExerciseFavorite: jest.fn(),
}));

import { useExercise } from '@/src/ui/exercises/hooks/useExercise';
import { useToggleExerciseFavorite } from '@/src/ui/exercises/hooks/useToggleExerciseFavorite';

const useExerciseMock = useExercise as jest.MockedFunction<typeof useExercise>;
const useToggleExerciseFavoriteMock = useToggleExerciseFavorite as jest.MockedFunction<
  typeof useToggleExerciseFavorite
>;

describe('ExerciseDetailView', () => {
  const mockToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useToggleExerciseFavoriteMock.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
    });
  });

  it('renders loading state', () => {
    useExerciseMock.mockReturnValue({
      exercise: undefined,
      isLoading: true,
      error: null,
    });

    render(<ExerciseDetailView />);

    expect(screen.getByText('Loading exercise...')).toBeTruthy();
  });

  it('renders exercise details and navigates to edit', () => {
    useExerciseMock.mockReturnValue({
      exercise: createMockExercise({
        id: 'exercise-1',
        name: 'Pendulum Squat',
        bodyPart: 'Upper Legs',
        primaryMuscles: ['Quads'],
        notes: 'Keep chest tall.',
      }),
      isLoading: false,
      error: null,
    });

    render(<ExerciseDetailView />);

    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
    expect(screen.getAllByText('2 × 8 @ 100 lbs').length).toBeGreaterThan(0);
    expect(screen.getByText('Upper Legs')).toBeTruthy();
    expect(screen.getByText('Quads')).toBeTruthy();
    expect(screen.getByText('Keep chest tall.')).toBeTruthy();

    fireEvent.press(screen.getByTestId('edit-exercise-button'));

    expect(mockPush).toHaveBeenCalledWith('/library/exercises/exercise-1/edit');
  });

  it('toggles favorite from detail view', () => {
    useExerciseMock.mockReturnValue({
      exercise: createMockExercise({
        id: 'exercise-1',
        name: 'Pendulum Squat',
        favorite: false,
      }),
      isLoading: false,
      error: null,
    });

    render(<ExerciseDetailView />);

    fireEvent.press(screen.getByTestId('favorite-exercise-button'));

    expect(mockToggleFavorite).toHaveBeenCalledWith('exercise-1', false);
  });
});
