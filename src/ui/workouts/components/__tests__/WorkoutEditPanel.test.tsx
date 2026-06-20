import { WorkoutEditPanel } from '@/src/ui/workouts/components/WorkoutEditPanel';
import { createMockExercise, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('@/src/ui/shared/components/DatePickerField', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    DatePickerField: () => <Text>Date picker</Text>,
  };
});

jest.mock('@/src/ui/shared/components/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}));

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
          <Pressable key={item.label} onPress={item.onPress}>
            <Text>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('@/src/ui/workouts/components/plannerDnD', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  return {
    ExerciseReorderList: () => (
      <View>
        <Text>Reorder list</Text>
      </View>
    ),
  };
});

describe('WorkoutEditPanel', () => {
  const exercisesById = new Map([
    ['exercise-1', createMockExercise({ id: 'exercise-1', name: 'Pendulum Squat' })],
  ]);
  const defaultProps = {
    workoutName: 'Wednesday Lower Body',
    workoutDate: createTestDate(),
    canChangeDate: true,
    onNameChange: jest.fn(),
    onDateChange: jest.fn(),
    onAddExercise: jest.fn(),
    onAddTemplate: jest.fn(),
    onRemoveExercise: jest.fn(),
    onReorder: jest.fn(),
  };

  it('renders date picker, add exercises, and reorder list', () => {
    render(
      <WorkoutEditPanel
        {...defaultProps}
        exercises={[createMockWorkoutExercise({ exerciseId: 'exercise-1' })]}
        exercisesById={exercisesById}
      />
    );

    expect(screen.getByText('Date picker')).toBeTruthy();
    expect(screen.getByText('Add')).toBeTruthy();
    expect(screen.getByText('Reorder list')).toBeTruthy();
    expect(screen.queryByText('Done')).toBeNull();
    expect(screen.queryByText('Remove')).toBeNull();
  });

  it('calls onNameChange when a new name is entered and blurred', () => {
    const onNameChange = jest.fn();

    render(
      <WorkoutEditPanel
        {...defaultProps}
        onNameChange={onNameChange}
        exercises={[createMockWorkoutExercise()]}
        exercisesById={exercisesById}
      />
    );

    fireEvent.changeText(screen.getByTestId('workout-name-input'), 'Friday Upper Body');
    fireEvent(screen.getByTestId('workout-name-input'), 'blur');

    expect(onNameChange).toHaveBeenCalledWith('Friday Upper Body');
  });

  it('reverts empty name on blur without calling onNameChange', () => {
    const onNameChange = jest.fn();

    render(
      <WorkoutEditPanel
        {...defaultProps}
        onNameChange={onNameChange}
        exercises={[createMockWorkoutExercise()]}
        exercisesById={exercisesById}
      />
    );

    fireEvent.changeText(screen.getByTestId('workout-name-input'), '   ');
    fireEvent(screen.getByTestId('workout-name-input'), 'blur');

    expect(onNameChange).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('Wednesday Lower Body')).toBeTruthy();
  });

  it('opens add menu and calls onAddExercise', () => {
    const onAddExercise = jest.fn();

    render(
      <WorkoutEditPanel
        {...defaultProps}
        onAddExercise={onAddExercise}
        exercises={[createMockWorkoutExercise()]}
        exercisesById={exercisesById}
      />
    );

    fireEvent.press(screen.getByText('Add'));
    fireEvent.press(screen.getByText('Exercises'));
    expect(onAddExercise).toHaveBeenCalled();
  });
});
