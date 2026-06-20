import { WorkoutModeView } from '@/src/ui/workouts/views/WorkoutModeView';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
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
    render(
      <WorkoutModeView
        workout={workout}
        exerciseNames={exerciseNames}
        onExit={jest.fn()}
        onFinish={jest.fn()}
        onSkip={jest.fn()}
        onExerciseChange={jest.fn()}
        onReorderExercises={jest.fn()}
      />
    );

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
    render(
      <WorkoutModeView
        workout={workout}
        exerciseNames={exerciseNames}
        onExit={jest.fn()}
        onFinish={jest.fn()}
        onSkip={jest.fn()}
        onExerciseChange={jest.fn()}
        onReorderExercises={jest.fn()}
      />
    );

    expect(screen.queryByText('Pendulum Squat')).toBeNull();
    expect(screen.getByText('Leg Press')).toBeTruthy();
  });

  it('shows completed exercises when toggle is enabled', () => {
    render(
      <WorkoutModeView
        workout={workout}
        exerciseNames={exerciseNames}
        onExit={jest.fn()}
        onFinish={jest.fn()}
        onSkip={jest.fn()}
        onExerciseChange={jest.fn()}
        onReorderExercises={jest.fn()}
      />
    );

    fireEvent.press(screen.getByLabelText('Show completed exercises'));
    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
  });

  it('calls session callbacks for exit, finish, and skip', () => {
    const onExit = jest.fn();
    const onFinish = jest.fn();
    const onSkip = jest.fn();

    render(
      <WorkoutModeView
        workout={workout}
        exerciseNames={exerciseNames}
        onExit={onExit}
        onFinish={onFinish}
        onSkip={onSkip}
        onExerciseChange={jest.fn()}
        onReorderExercises={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText('Exit Workout'));
    fireEvent.press(screen.getByText('Finish Workout'));
    fireEvent.press(screen.getByText('Skip Workout'));

    expect(onExit).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
    expect(onSkip).toHaveBeenCalled();
  });
});
