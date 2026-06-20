import { LibraryView } from '@/src/ui/exercises/views/LibraryView';
import { createMockExercise, createMockTemplateBlock } from '@/test-utils/mockData';
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/src/ui/exercises/hooks/useExerciseLibrary', () => ({
  useExerciseLibrary: jest.fn(),
}));

jest.mock('@/src/ui/templateBlocks/hooks/useTemplateBlocks', () => ({
  useTemplateBlocks: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: View,
    Swipeable: ({
      children,
      renderRightActions,
    }: {
      children: React.ReactNode;
      renderRightActions?: () => React.ReactNode;
    }) => (
      <View>
        {children}
        {renderRightActions?.()}
      </View>
    ),
  };
});

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('@/src/ui/shared/components/ConfirmDialog', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    ConfirmDialog: ({
      triggerLabel,
      title,
      open,
      hideTrigger,
      onConfirm,
    }: {
      triggerLabel: string;
      title: string;
      open?: boolean;
      hideTrigger?: boolean;
      onConfirm?: () => void;
    }) => {
      if (hideTrigger && !open) {
        return null;
      }

      return (
        <View>
          {!hideTrigger ? (
            <Pressable accessibilityRole="button" onPress={onConfirm}>
              <Text>{triggerLabel}</Text>
            </Pressable>
          ) : null}
          {open ? <Text>{title}</Text> : !hideTrigger ? <Text>{title}</Text> : null}
        </View>
      );
    },
  };
});

import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { useTemplateBlocks } from '@/src/ui/templateBlocks/hooks/useTemplateBlocks';

const useExerciseLibraryMock = useExerciseLibrary as jest.MockedFunction<typeof useExerciseLibrary>;
const useTemplateBlocksMock = useTemplateBlocks as jest.MockedFunction<typeof useTemplateBlocks>;

function mockLibrary(overrides: Partial<ReturnType<typeof useExerciseLibrary>> = {}) {
  useExerciseLibraryMock.mockReturnValue({
    exercises: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    archiveExercise: jest.fn(),
    restoreExercise: jest.fn(),
    toggleFavorite: jest.fn(),
    deleteExercise: jest.fn(),
    ...overrides,
  });
}

function mockTemplates(overrides: Partial<ReturnType<typeof useTemplateBlocks>> = {}) {
  useTemplateBlocksMock.mockReturnValue({
    templateBlocks: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    archiveTemplateBlock: jest.fn(),
    restoreTemplateBlock: jest.fn(),
    toggleFavorite: jest.fn(),
    ...overrides,
  });
}

describe('LibraryView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLibrary();
    mockTemplates();
  });

  it('renders loading state', () => {
    mockLibrary({ isLoading: true });

    render(<LibraryView />);

    expect(screen.getByText('Loading exercises...')).toBeTruthy();
  });

  it('renders empty state with create action', () => {
    render(<LibraryView />);

    expect(screen.getByText('No exercises yet')).toBeTruthy();
    expect(screen.getByText('Create')).toBeTruthy();
  });

  it('navigates to create exercise screen', () => {
    render(<LibraryView />);

    fireEvent.press(screen.getByText('Create'));

    expect(mockPush).toHaveBeenCalledWith('/library/exercises/new');
  });

  it('renders error state', () => {
    mockLibrary({ error: new Error('Failed') });

    render(<LibraryView />);

    expect(screen.getByText('Unable to load exercises')).toBeTruthy();
  });

  it('renders populated exercise list', () => {
    mockLibrary({
      exercises: [
        createMockExercise({ id: '1', name: 'Pendulum Squat' }),
        createMockExercise({ id: '2', name: 'Romanian Deadlift' }),
      ],
    });

    render(<LibraryView />);

    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
    expect(screen.getByText('Romanian Deadlift')).toBeTruthy();
  });

  it('navigates to exercise detail on row press', () => {
    mockLibrary({
      exercises: [createMockExercise({ id: '1', name: 'Pendulum Squat' })],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByText('Pendulum Squat'));

    expect(mockPush).toHaveBeenCalledWith('/library/exercises/1');
  });

  it('filters exercises by search', () => {
    mockLibrary({
      exercises: [
        createMockExercise({ id: '1', name: 'Pendulum Squat' }),
        createMockExercise({ id: '2', name: 'Romanian Deadlift' }),
      ],
    });

    render(<LibraryView />);

    fireEvent.changeText(screen.getByTestId('library-search'), 'deadlift');

    expect(screen.queryByText('Pendulum Squat')).toBeNull();
    expect(screen.getByText('Romanian Deadlift')).toBeTruthy();
  });

  it('filters exercises by status', () => {
    mockLibrary({
      exercises: [
        createMockExercise({ id: '1', name: 'Pendulum Squat', status: 'active' }),
        createMockExercise({ id: '2', name: 'Old Exercise', status: 'archived' }),
      ],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('status-filter-archived'));

    expect(screen.queryByText('Pendulum Squat')).toBeNull();
    expect(screen.getByText('Old Exercise')).toBeTruthy();
  });

  it('filters exercises by favorites', () => {
    mockLibrary({
      exercises: [
        createMockExercise({ id: '1', name: 'Pendulum Squat', favorite: true }),
        createMockExercise({ id: '2', name: 'Romanian Deadlift', favorite: false }),
      ],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('favorites-only-checkbox'));

    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
    expect(screen.queryByText('Romanian Deadlift')).toBeNull();
  });

  it('shows archive confirmation copy', () => {
    mockLibrary({
      exercises: [createMockExercise({ id: '1', name: 'Pendulum Squat', status: 'active' })],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('archive-exercise-1'));

    expect(screen.getByText('Archive this exercise?')).toBeTruthy();
  });

  it('shows restore action for archived exercises', () => {
    mockLibrary({
      exercises: [createMockExercise({ id: '1', name: 'Old Exercise', status: 'archived' })],
    });

    render(<LibraryView />);

    expect(screen.getByTestId('restore-exercise-1')).toBeTruthy();
    expect(screen.queryByTestId('archive-exercise-1')).toBeNull();
  });

  it('switches to templates tab', () => {
    mockTemplates({
      templateBlocks: [
        {
          id: 'block-1',
          name: 'Shoulder Rehab',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active',
          exerciseIds: ['1', '2', '3'],
        },
      ],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('library-segmented-control-templates'));

    expect(screen.getByText('Shoulder Rehab')).toBeTruthy();
    expect(screen.getByText('3 exercises')).toBeTruthy();
  });

  it('renders template empty state', () => {
    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('library-segmented-control-templates'));

    expect(screen.getByText('No templates yet')).toBeTruthy();
  });

  it('navigates to create template screen', () => {
    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('library-segmented-control-templates'));
    fireEvent.press(screen.getByText('Create'));

    expect(mockPush).toHaveBeenCalledWith('/library/template-blocks/new');
  });

  it('navigates to template detail on row press', () => {
    mockTemplates({
      templateBlocks: [
        createMockTemplateBlock({ id: 'block-1', name: 'Shoulder Rehab' }),
      ],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('library-segmented-control-templates'));
    fireEvent.press(screen.getByText('Shoulder Rehab'));

    expect(mockPush).toHaveBeenCalledWith('/library/template-blocks/block-1');
  });

  it('filters templates by status', () => {
    mockTemplates({
      templateBlocks: [
        createMockTemplateBlock({ id: 'block-1', name: 'Active Block', status: 'active' }),
        createMockTemplateBlock({ id: 'block-2', name: 'Archived Block', status: 'archived' }),
      ],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('library-segmented-control-templates'));
    fireEvent.press(screen.getByTestId('template-status-filter-archived'));

    expect(screen.queryByText('Active Block')).toBeNull();
    expect(screen.getByText('Archived Block')).toBeTruthy();
  });

  it('filters templates by favorites', () => {
    mockTemplates({
      templateBlocks: [
        createMockTemplateBlock({ id: 'block-1', name: 'Favorite Block', favorite: true }),
        createMockTemplateBlock({ id: 'block-2', name: 'Other Block', favorite: false }),
      ],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('library-segmented-control-templates'));
    fireEvent.press(screen.getByTestId('template-favorites-only-checkbox'));

    expect(screen.getByText('Favorite Block')).toBeTruthy();
    expect(screen.queryByText('Other Block')).toBeNull();
  });

  it('shows archive confirmation for templates', () => {
    mockTemplates({
      templateBlocks: [createMockTemplateBlock({ id: 'block-1', name: 'Shoulder Rehab' })],
    });

    render(<LibraryView />);

    fireEvent.press(screen.getByTestId('library-segmented-control-templates'));
    fireEvent.press(screen.getByTestId('archive-template-block-1'));

    expect(screen.getByText('Archive this template block?')).toBeTruthy();
  });
});
