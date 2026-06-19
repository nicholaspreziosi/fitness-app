import { ExerciseCreateView } from '@/src/ui/exercises/views/ExerciseCreateView';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCreateExercise = jest.fn();

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: mockBack,
    replace: mockReplace,
  }),
}));

jest.mock('@/src/ui/exercises/hooks/useExerciseFormActions', () => ({
  useExerciseFormActions: () => ({
    createExercise: mockCreateExercise,
    isSaving: false,
    error: null,
  }),
}));

describe('ExerciseCreateView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateExercise.mockResolvedValue(undefined);
  });

  it('creates an active exercise and navigates back', async () => {
    render(<ExerciseCreateView />);

    fireEvent.changeText(screen.getByPlaceholderText('Exercise name'), 'Pendulum Squat');

    await act(async () => {
      fireEvent.press(screen.getByText('Save exercise'));
    });

    expect(mockCreateExercise).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pendulum Squat',
        status: 'active',
      })
    );
    expect(mockReplace).toHaveBeenCalledWith('/library');
  });

  it('creates a draft exercise from save draft', async () => {
    render(<ExerciseCreateView />);

    fireEvent.changeText(screen.getByPlaceholderText('Exercise name'), 'Pendulum Squat');

    await act(async () => {
      fireEvent.press(screen.getByText('Save draft'));
    });

    expect(mockCreateExercise).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pendulum Squat',
        status: 'draft',
      })
    );
    expect(mockReplace).toHaveBeenCalledWith('/library');
  });
});
