import { ExercisePickerSheet } from '@/src/ui/workouts/components/ExercisePickerSheet';
import {
  createMockExercise,
  createMockWorkout,
  createMockWorkoutExercise,
} from '@/test-utils/mockData';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const mockAddExercises = jest.fn();
const mockOnClose = jest.fn();
const mockUseExerciseLibrary = jest.fn();

jest.mock('@/src/ui/exercises/hooks/useExerciseLibrary', () => ({
  useExerciseLibrary: () => mockUseExerciseLibrary(),
}));

jest.mock('@/src/ui/workouts/hooks/useWorkoutMutations', () => ({
  useWorkoutMutations: () => ({
    addExercises: {
      mutateAsync: mockAddExercises,
      isPending: false,
    },
  }),
}));

describe('ExercisePickerSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddExercises.mockResolvedValue(undefined);
    mockUseExerciseLibrary.mockReturnValue({
      exercises: [
        createMockExercise({ id: 'exercise-1', name: 'Pendulum Squat' }),
        createMockExercise({ id: 'exercise-2', name: 'Leg Extension' }),
        createMockExercise({ id: 'exercise-3', name: 'Archived Exercise', status: 'archived' }),
      ],
      isLoading: false,
    });
  });

  it('adds multiple selected exercises at once', async () => {
    render(
      <ExercisePickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(screen.getByTestId('exercise-picker-exercise-1'));
    fireEvent.press(screen.getByTestId('exercise-picker-exercise-2'));
    fireEvent.press(screen.getByTestId('add-selected-exercises'));

    await waitFor(() => {
      expect(mockAddExercises).toHaveBeenCalledWith({
        workoutId: 'workout-1',
        exerciseIds: ['exercise-1', 'exercise-2'],
      });
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables add until at least one exercise is selected', () => {
    render(
      <ExercisePickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('add-selected-exercises')).toBeDisabled();
  });

  it('filters exercises by search', () => {
    render(
      <ExercisePickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
    expect(screen.getByText('Leg Extension')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('exercise-picker-search'), 'leg');

    expect(screen.queryByText('Pendulum Squat')).toBeNull();
    expect(screen.getByText('Leg Extension')).toBeTruthy();
  });

  it('does not list archived exercises', () => {
    render(
      <ExercisePickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Archived Exercise')).toBeNull();
  });

  it('does not list exercises already in the workout', () => {
    render(
      <ExercisePickerSheet
        workout={createMockWorkout({
          id: 'workout-1',
          exercises: [createMockWorkoutExercise({ exerciseId: 'exercise-1' })],
        })}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Pendulum Squat')).toBeNull();
    expect(screen.getByText('Leg Extension')).toBeTruthy();
  });

  it('filters exercises by favorites', () => {
    mockUseExerciseLibrary.mockReturnValue({
      exercises: [
        createMockExercise({ id: 'exercise-1', name: 'Pendulum Squat', favorite: true }),
        createMockExercise({ id: 'exercise-2', name: 'Leg Extension', favorite: false }),
      ],
      isLoading: false,
    });

    render(
      <ExercisePickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    fireEvent(screen.getByLabelText('Favorites only'), 'onCheckedChange', true);

    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
    expect(screen.queryByText('Leg Extension')).toBeNull();
  });

  it('filters exercises by body part chips', () => {
    mockUseExerciseLibrary.mockReturnValue({
      exercises: [
        createMockExercise({ id: 'exercise-1', name: 'Pendulum Squat', bodyPart: 'Upper Legs' }),
        createMockExercise({ id: 'exercise-2', name: 'Leg Extension', bodyPart: 'Upper Legs' }),
        createMockExercise({ id: 'exercise-4', name: 'Ab Roller', bodyPart: 'Core' }),
      ],
      isLoading: false,
    });

    render(
      <ExercisePickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(screen.getByTestId('exercise-picker-body-part-Core'));

    expect(screen.getByText('Ab Roller')).toBeTruthy();
    expect(screen.queryByText('Pendulum Squat')).toBeNull();
    expect(screen.queryByText('Leg Extension')).toBeNull();
  });
});
