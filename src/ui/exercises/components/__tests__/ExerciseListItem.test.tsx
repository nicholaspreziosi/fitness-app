import { ExerciseListItem } from '@/src/ui/exercises/components/ExerciseListItem';
import { presentedActionSheet } from '@/test-utils/actionSheet';
import { createMockExercise } from '@/test-utils/mockData';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
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


describe('ExerciseListItem', () => {
  it('shows delete action for unused exercises', () => {
    render(
      <ExerciseListItem
        canDelete
        exercise={createMockExercise({ id: 'exercise-1', status: 'active' })}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
        onPress={jest.fn()}
        onRestore={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );

    expect(screen.getByTestId('delete-exercise-exercise-1')).toBeTruthy();
  });

  it('hides delete action for used exercises', () => {
    render(
      <ExerciseListItem
        canDelete={false}
        exercise={createMockExercise({ id: 'exercise-1', status: 'active' })}
        onArchive={jest.fn()}
        onDelete={jest.fn()}
        onPress={jest.fn()}
        onRestore={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );

    expect(screen.getByTestId('archive-exercise-exercise-1')).toBeTruthy();
    expect(screen.queryByTestId('delete-exercise-exercise-1')).toBeNull();
  });

  it('confirms archive through a native action sheet', () => {
    const onArchive = jest.fn();

    render(
      <ExerciseListItem
        canDelete={false}
        exercise={createMockExercise({ id: 'exercise-1', status: 'active' })}
        onArchive={onArchive}
        onDelete={jest.fn()}
        onPress={jest.fn()}
        onRestore={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );

    fireEvent.press(screen.getByTestId('archive-exercise-exercise-1'));
    const sheet = presentedActionSheet();
    expect(sheet.title).toBe('Archive this exercise?');
    sheet.selectLabel('Archive');

    expect(onArchive).toHaveBeenCalledWith('exercise-1');
  });
});
