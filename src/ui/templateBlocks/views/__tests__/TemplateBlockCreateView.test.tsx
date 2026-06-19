import { TemplateBlockCreateView } from '@/src/ui/templateBlocks/views/TemplateBlockCreateView';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockCreateTemplateBlock = jest.fn();

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/src/ui/templateBlocks/hooks/useTemplateBlockFormActions', () => ({
  useTemplateBlockFormActions: () => ({
    createTemplateBlock: mockCreateTemplateBlock,
    isSaving: false,
    error: null,
  }),
}));

jest.mock('@/src/ui/exercises/hooks/useExerciseLibrary', () => ({
  useExerciseLibrary: () => ({
    exercises: [
      {
        id: 'exercise-1',
        name: 'Pendulum Squat',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe('TemplateBlockCreateView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTemplateBlock.mockResolvedValue(undefined);
  });

  it('creates an active template block and navigates back', async () => {
    render(<TemplateBlockCreateView />);

    fireEvent.changeText(screen.getByPlaceholderText('Template name'), 'Quad Strength');
    fireEvent.press(screen.getByTestId('add-exercise-exercise-1'));

    await act(async () => {
      fireEvent.press(screen.getByText('Save template'));
    });

    expect(mockCreateTemplateBlock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Quad Strength',
        status: 'active',
        exerciseIds: ['exercise-1'],
      })
    );
    expect(mockReplace).toHaveBeenCalledWith('/library');
  });
});
