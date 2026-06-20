import { TemplateBlockDetailView } from '@/src/ui/templateBlocks/views/TemplateBlockDetailView';
import { createMockTemplateBlock } from '@/test-utils/mockData';
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
  useLocalSearchParams: () => ({ id: 'block-1' }),
}));

jest.mock('@/src/ui/templateBlocks/hooks/useTemplateBlock', () => ({
  useTemplateBlock: jest.fn(),
}));

jest.mock('@/src/ui/exercises/hooks/useExerciseLibrary', () => ({
  useExerciseLibrary: jest.fn(),
}));

jest.mock('@/src/ui/templateBlocks/hooks/useToggleTemplateBlockFavorite', () => ({
  useToggleTemplateBlockFavorite: jest.fn(),
}));

import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { useTemplateBlock } from '@/src/ui/templateBlocks/hooks/useTemplateBlock';
import { useToggleTemplateBlockFavorite } from '@/src/ui/templateBlocks/hooks/useToggleTemplateBlockFavorite';

const useTemplateBlockMock = useTemplateBlock as jest.MockedFunction<typeof useTemplateBlock>;
const useExerciseLibraryMock = useExerciseLibrary as jest.MockedFunction<typeof useExerciseLibrary>;
const useToggleTemplateBlockFavoriteMock =
  useToggleTemplateBlockFavorite as jest.MockedFunction<typeof useToggleTemplateBlockFavorite>;

describe('TemplateBlockDetailView', () => {
  const mockToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useToggleTemplateBlockFavoriteMock.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
    });
  });

  it('renders template details and navigates to edit', () => {
    useTemplateBlockMock.mockReturnValue({
      templateBlock: createMockTemplateBlock({
        id: 'block-1',
        name: 'Quad Strength',
        exerciseIds: ['exercise-1', 'exercise-2'],
        notes: 'Heavy leg day.',
      }),
      isLoading: false,
      error: null,
    });

    useExerciseLibraryMock.mockReturnValue({
      exercises: [
        {
          id: 'exercise-1',
          name: 'Pendulum Squat',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active',
        },
        {
          id: 'exercise-2',
          name: 'Leg Press',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active',
        },
      ],
      isLoading: false,
      isRefreshing: false,
      error: null,
      archiveExercise: jest.fn(),
      restoreExercise: jest.fn(),
      toggleFavorite: jest.fn(),
      deleteExercise: jest.fn(),
    });

    render(<TemplateBlockDetailView />);

    expect(screen.getByText('Quad Strength')).toBeTruthy();
    expect(screen.getByText('2 exercises')).toBeTruthy();
    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
    expect(screen.getByText('Leg Press')).toBeTruthy();
    expect(screen.getByText('Heavy leg day.')).toBeTruthy();

    fireEvent.press(screen.getByTestId('template-exercise-row-exercise-1'));

    expect(mockPush).toHaveBeenCalledWith('/library/exercises/exercise-1');

    fireEvent.press(screen.getByTestId('edit-template-button'));

    expect(mockPush).toHaveBeenCalledWith('/library/template-blocks/block-1/edit');
  });

  it('toggles favorite from detail view', () => {
    useTemplateBlockMock.mockReturnValue({
      templateBlock: createMockTemplateBlock({
        id: 'block-1',
        name: 'Quad Strength',
        favorite: true,
      }),
      isLoading: false,
      error: null,
    });

    useExerciseLibraryMock.mockReturnValue({
      exercises: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      archiveExercise: jest.fn(),
      restoreExercise: jest.fn(),
      toggleFavorite: jest.fn(),
      deleteExercise: jest.fn(),
    });

    render(<TemplateBlockDetailView />);

    fireEvent.press(screen.getByTestId('favorite-template-button'));

    expect(mockToggleFavorite).toHaveBeenCalledWith('block-1', true);
  });
});
