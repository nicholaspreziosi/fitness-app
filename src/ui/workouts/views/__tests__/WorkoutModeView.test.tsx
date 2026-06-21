import { WorkoutModeView } from '@/src/ui/workouts/views/WorkoutModeView';
import { RefreshGuardProvider } from '@/src/ui/shared/providers/RefreshGuardProvider';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

const mockSetPreference = jest.fn();
let mockShowCompleted = false;

jest.mock('@/src/ui/shared/hooks/useUiPreferences', () => ({
  useUiPreferences: () => ({
    preferences: { showCompletedExercises: mockShowCompleted },
    isLoading: false,
    setPreference: (...args: unknown[]) => {
      mockSetPreference(...args);
      if (args[0] === 'showCompletedExercises') {
        mockShowCompleted = Boolean(args[1]);
      }
    },
    updatePreferences: jest.fn(),
  }),
}));

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});

jest.mock('@/src/ui/shared/components/PopoverMenu', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    PopoverMenu: ({
      trigger,
      items,
    }: {
      trigger?: React.ReactNode;
      items: Array<{ label: string; onPress: () => void; testID?: string }>;
    }) => (
      <View>
        {trigger}
        {items.map((item) => (
          <Pressable key={item.label} testID={item.testID} onPress={item.onPress}>
            <Text>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('@/src/ui/workouts/components/ExercisePickerSheet', () => ({
  ExercisePickerSheet: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Exercise picker sheet</Text>;
  },
}));

jest.mock('@/src/ui/workouts/components/TemplateBlockPickerSheet', () => ({
  TemplateBlockPickerSheet: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Template picker sheet</Text>;
  },
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

jest.mock('react-native-draggable-flatlist', () => {
  const React = require('react');
  const { View } = require('react-native');

  return function DraggableFlatList({
    data,
    renderItem,
  }: {
    data: unknown[];
    renderItem: (params: { item: unknown; drag: () => void; isActive: boolean }) => React.ReactNode;
  }) {
    return (
      <View>
        {data.map((item) => (
          <View key={(item as { id: string }).id}>
            {renderItem({ item, drag: jest.fn(), isActive: false })}
          </View>
        ))}
      </View>
    );
  };
});

describe('WorkoutModeView', () => {
  function renderView(props: React.ComponentProps<typeof WorkoutModeView>) {
    return render(
      <RefreshGuardProvider>
        <WorkoutModeView {...props} />
      </RefreshGuardProvider>
    );
  }

  beforeEach(() => {
    mockShowCompleted = false;
    mockSetPreference.mockClear();
  });

  const workout = createMockWorkout({
    id: 'workout-1',
    name: 'Lower Body',
    status: 'inProgress',
    exercises: [
      createMockWorkoutExercise({ id: 'we-1', exerciseId: 'exercise-1', completed: true }),
      createMockWorkoutExercise({ id: 'we-2', exerciseId: 'exercise-2', completed: false }),
    ],
  });

  const exerciseNames = {
    'exercise-1': 'Pendulum Squat',
    'exercise-2': 'Leg Press',
  };

  it('shows header, progress card, toggle, exercise cards, and finish/skip actions', () => {
    renderView({
      workout,
      exerciseNames,
      onExit: jest.fn(),
      onFinish: jest.fn(),
      onSkip: jest.fn(),
      onRemoveExercise: jest.fn(),
      onExerciseChange: jest.fn(),
      onReorderExercises: jest.fn(),
    });

    expect(screen.getByText('Lower Body')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Exit Workout')).toBeTruthy();
    expect(screen.getByText('1 of 2 exercises complete')).toBeTruthy();
    expect(screen.getByText('Show completed exercises')).toBeTruthy();
    expect(screen.getByText('Finish Workout')).toBeTruthy();
    expect(screen.getByText('Skip Workout')).toBeTruthy();
    expect(screen.getByText('Leg Press')).toBeTruthy();
  });

  it('hides completed exercises by default', () => {
    renderView({
      workout,
      exerciseNames,
      onExit: jest.fn(),
      onFinish: jest.fn(),
      onSkip: jest.fn(),
      onRemoveExercise: jest.fn(),
      onExerciseChange: jest.fn(),
      onReorderExercises: jest.fn(),
    });

    expect(screen.queryByText('Pendulum Squat')).toBeNull();
    expect(screen.getByText('Leg Press')).toBeTruthy();
  });

  it('shows completed exercises when toggle is enabled', () => {
    mockShowCompleted = true;

    renderView({
      workout,
      exerciseNames,
      onExit: jest.fn(),
      onFinish: jest.fn(),
      onSkip: jest.fn(),
      onRemoveExercise: jest.fn(),
      onExerciseChange: jest.fn(),
      onReorderExercises: jest.fn(),
    });

    fireEvent.press(screen.getByLabelText('Show completed exercises'));
    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
  });

  it('calls session callbacks for exit, finish, and skip', () => {
    const onExit = jest.fn();
    const onFinish = jest.fn();
    const onSkip = jest.fn();

    renderView({
      workout,
      exerciseNames,
      onExit: onExit,
      onFinish: onFinish,
      onSkip: onSkip,
      onRemoveExercise: jest.fn(),
      onExerciseChange: jest.fn(),
      onReorderExercises: jest.fn(),
    });

    fireEvent.press(screen.getByText('Exit Workout'));
    fireEvent.press(screen.getByText('Finish Workout'));
    fireEvent.press(screen.getByText('Skip Workout'));

    expect(onExit).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(onSkip).toHaveBeenCalled();
  });

  it('opens exercise and template picker sheets from add menu', () => {
    renderView({
      workout,
      exerciseNames,
      onExit: jest.fn(),
      onFinish: jest.fn(),
      onSkip: jest.fn(),
      onRemoveExercise: jest.fn(),
      onExerciseChange: jest.fn(),
      onReorderExercises: jest.fn(),
    });

    fireEvent.press(screen.getByTestId('workout-mode-add-exercises'));
    expect(screen.getByText('Exercise picker sheet')).toBeTruthy();

    fireEvent.press(screen.getByTestId('workout-mode-add-templates'));
    expect(screen.getByText('Template picker sheet')).toBeTruthy();
  });

  it('calls onRemoveExercise when delete action is pressed', () => {
    const onRemoveExercise = jest.fn();

    renderView({
      workout,
      exerciseNames,
      onExit: jest.fn(),
      onFinish: jest.fn(),
      onSkip: jest.fn(),
      onRemoveExercise,
      onExerciseChange: jest.fn(),
      onReorderExercises: jest.fn(),
    });

    fireEvent.press(screen.getByTestId('delete-exercise-we-2'));
    expect(onRemoveExercise).toHaveBeenCalledWith('we-2');
  });
});
