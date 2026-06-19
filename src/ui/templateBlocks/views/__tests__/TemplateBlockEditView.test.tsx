import { TemplateBlockEditView } from '@/src/ui/templateBlocks/views/TemplateBlockEditView';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockUpdateTemplateBlock = jest.fn();

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'block-1' }),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/src/ui/templateBlocks/hooks/useTemplateBlock', () => ({
  useTemplateBlock: () => ({
    templateBlock: {
      id: 'block-1',
      name: 'Quad Strength',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      exerciseIds: ['exercise-1'],
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/src/ui/templateBlocks/hooks/useTemplateBlockFormActions', () => ({
  useTemplateBlockFormActions: () => ({
    updateTemplateBlock: mockUpdateTemplateBlock,
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

describe('TemplateBlockEditView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateTemplateBlock.mockResolvedValue(undefined);
  });

  it('updates template block and navigates back', async () => {
    render(<TemplateBlockEditView />);

    fireEvent.changeText(screen.getByPlaceholderText('Template name'), 'Updated Block');

    await act(async () => {
      fireEvent.press(screen.getByText('Save template'));
    });

    expect(mockUpdateTemplateBlock).toHaveBeenCalledWith(
      'block-1',
      expect.objectContaining({
        name: 'Updated Block',
      })
    );
    expect(mockReplace).toHaveBeenCalledWith('/library');
  });
});
