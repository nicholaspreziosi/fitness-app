import { ExerciseDetailView } from '@/src/ui/exercises/views/ExerciseDetailView';
import { createMockExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
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

jest.mock('@/src/ui/exercises/hooks/useExerciseHistory', () => ({
  useExerciseHistory: jest.fn(),
}));

jest.mock('@/src/ui/exercises/hooks/useToggleExerciseFavorite', () => ({
  useToggleExerciseFavorite: jest.fn(),
}));

jest.mock('react-native-gifted-charts', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    LineChart: () => <View testID="exercise-history-line-chart" />,
  };
});

import { useExercise } from '@/src/ui/exercises/hooks/useExercise';
import { useExerciseHistory } from '@/src/ui/exercises/hooks/useExerciseHistory';
import { useToggleExerciseFavorite } from '@/src/ui/exercises/hooks/useToggleExerciseFavorite';

const useExerciseMock = useExercise as jest.MockedFunction<typeof useExercise>;
const useExerciseHistoryMock = useExerciseHistory as jest.MockedFunction<typeof useExerciseHistory>;
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
    useExerciseHistoryMock.mockReturnValue({
      history: [],
      isLoading: false,
      error: null,
    });
  });

  it('renders loading state', () => {
    useExerciseMock.mockReturnValue({
      exercise: undefined,
      isLoading: true,
      error: null,
    });

    render(<ExerciseDetailView />);

    expect(screen.getByLabelText('loading')).toBeTruthy();
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
    expect(screen.getAllByText('2 x 8 • 100 lbs').length).toBeGreaterThan(0);
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

  it('renders history section and wires exercise history into the chart', () => {
    useExerciseMock.mockReturnValue({
      exercise: createMockExercise({
        id: 'exercise-1',
        name: 'Pendulum Squat',
      }),
      isLoading: false,
      error: null,
    });
    useExerciseHistoryMock.mockReturnValue({
      history: [
        {
          workoutId: 'workout-1',
          date: createTestDate(0),
          weight: 100,
          reps: 8,
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<ExerciseDetailView />);

    expect(useExerciseHistoryMock).toHaveBeenCalledWith('exercise-1');
    expect(screen.getByText('History')).toBeTruthy();
    expect(screen.getByTestId('exercise-history-chart')).toBeTruthy();
    expect(screen.getByTestId('exercise-history-line-chart')).toBeTruthy();
  });
});
