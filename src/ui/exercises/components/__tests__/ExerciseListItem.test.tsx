import { ExerciseListItem } from '@/src/ui/exercises/components/ExerciseListItem';
import { createMockExercise } from '@/test-utils/mockData';
import { render, screen } from '@testing-library/react-native';

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

jest.mock('@/src/ui/shared/components/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}));

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
});
