import { ExerciseEditView } from '@/src/ui/exercises/views/ExerciseEditView';
import { createMockExercise } from '@/test-utils/mockData';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockUpdateExercise = jest.fn();

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
  }),
  useLocalSearchParams: () => ({ id: 'exercise-1' }),
}));

jest.mock('@/src/ui/exercises/hooks/useExercise', () => ({
  useExercise: jest.fn(),
}));

jest.mock('@/src/ui/exercises/hooks/useExerciseFormActions', () => ({
  useExerciseFormActions: () => ({
    updateExercise: mockUpdateExercise,
    isSaving: false,
    error: null,
  }),
}));

import { useExercise } from '@/src/ui/exercises/hooks/useExercise';

const useExerciseMock = useExercise as jest.MockedFunction<typeof useExercise>;

describe('ExerciseEditView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateExercise.mockResolvedValue(undefined);
  });

  it('renders loading state', () => {
    useExerciseMock.mockReturnValue({
      exercise: undefined,
      isLoading: true,
      error: null,
    });

    render(<ExerciseEditView />);

    expect(screen.getByLabelText('loading')).toBeTruthy();
  });

  it('renders form with exercise data and saves changes', async () => {
    useExerciseMock.mockReturnValue({
      exercise: createMockExercise({ id: 'exercise-1', name: 'Pendulum Squat' }),
      isLoading: false,
      error: null,
    });

    render(<ExerciseEditView />);

    expect(screen.getByDisplayValue('Pendulum Squat')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Exercise name'), 'Updated Squat');

    await act(async () => {
      fireEvent.press(screen.getByText('Save exercise'));
    });

    expect(mockUpdateExercise).toHaveBeenCalledWith(
      'exercise-1',
      expect.objectContaining({ name: 'Updated Squat' })
    );
    expect(mockReplace).toHaveBeenCalledWith('/library/exercises/exercise-1');
  });
});
