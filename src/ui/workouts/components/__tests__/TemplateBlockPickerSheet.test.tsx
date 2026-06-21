import { TemplateBlockPickerSheet } from '@/src/ui/workouts/components/TemplateBlockPickerSheet';
import {
  createMockTemplateBlock,
  createMockWorkout,
  createMockWorkoutExercise,
} from '@/test-utils/mockData';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const mockAddTemplateBlocks = jest.fn();
const mockOnClose = jest.fn();

jest.mock('@/src/ui/templateBlocks/hooks/useTemplateBlocks', () => {
  const { createMockTemplateBlock } = require('@/test-utils/mockData');

  return {
    useTemplateBlocks: () => ({
      templateBlocks: [
        createMockTemplateBlock({ id: 'block-1', name: 'Quad Strength', exerciseIds: ['exercise-1'] }),
        createMockTemplateBlock({
          id: 'block-2',
          name: 'Shoulder Rehab',
          exerciseIds: ['exercise-2'],
        }),
        createMockTemplateBlock({
          id: 'block-3',
          name: 'Archived Block',
          status: 'archived',
          exerciseIds: ['exercise-3'],
        }),
      ],
      isLoading: false,
    }),
  };
});

jest.mock('@/src/ui/workouts/hooks/useWorkoutMutations', () => ({
  useWorkoutMutations: () => ({
    addTemplateBlocks: {
      mutateAsync: mockAddTemplateBlocks,
      isPending: false,
    },
  }),
}));

describe('TemplateBlockPickerSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddTemplateBlocks.mockResolvedValue(undefined);
  });

  it('adds multiple selected template blocks at once', async () => {
    render(
      <TemplateBlockPickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(screen.getByTestId('template-picker-block-1'));
    fireEvent.press(screen.getByTestId('template-picker-block-2'));
    fireEvent.press(screen.getByTestId('add-selected-templates'));

    await waitFor(() => {
      expect(mockAddTemplateBlocks).toHaveBeenCalledWith({
        workoutId: 'workout-1',
        templateBlockIds: ['block-1', 'block-2'],
      });
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('filters template blocks by search', () => {
    render(
      <TemplateBlockPickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quad Strength')).toBeTruthy();
    expect(screen.getByText('Shoulder Rehab')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('template-picker-search'), 'shoulder');

    expect(screen.queryByText('Quad Strength')).toBeNull();
    expect(screen.getByText('Shoulder Rehab')).toBeTruthy();
  });

  it('does not list archived template blocks', () => {
    render(
      <TemplateBlockPickerSheet
        workout={createMockWorkout({ id: 'workout-1', exercises: [] })}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Archived Block')).toBeNull();
  });

  it('does not list template blocks whose exercises are already in the workout', () => {
    render(
      <TemplateBlockPickerSheet
        workout={createMockWorkout({
          id: 'workout-1',
          exercises: [createMockWorkoutExercise({ exerciseId: 'exercise-1' })],
        })}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Quad Strength')).toBeNull();
    expect(screen.getByText('Shoulder Rehab')).toBeTruthy();
  });
});
