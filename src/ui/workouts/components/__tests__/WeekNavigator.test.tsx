import { WeekNavigator } from '@/src/ui/workouts/components/WeekNavigator';
import { createTestDate } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Gesture: {
      Pan: () => ({
        activeOffsetX: () => ({
          failOffsetY: () => ({
            onEnd: () => ({}),
          }),
        }),
      }),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('react-native-reanimated', () => ({
  runOnJS: (fn: () => void) => fn,
}));

jest.mock('@/src/ui/profile/hooks/useWeekStartDay', () => ({
  useWeekStartDay: () => 1,
}));

describe('WeekNavigator', () => {
  it('renders the week label', () => {
    render(
      <WeekNavigator
        weekAnchor={createTestDate(0)}
        onPreviousWeek={jest.fn()}
        onNextWeek={jest.fn()}
        onOpenWeekPicker={jest.fn()}
      />
    );

    expect(screen.getByText('Jun 10 - 16')).toBeTruthy();
  });

  it('opens the week picker from the label', () => {
    const onOpenWeekPicker = jest.fn();

    render(
      <WeekNavigator
        weekAnchor={createTestDate(0)}
        onPreviousWeek={jest.fn()}
        onNextWeek={jest.fn()}
        onOpenWeekPicker={onOpenWeekPicker}
      />
    );

    fireEvent.press(screen.getByText('Jun 10 - 16'));

    expect(onOpenWeekPicker).toHaveBeenCalledTimes(1);
  });

  it('steps between weeks', () => {
    const onPreviousWeek = jest.fn();
    const onNextWeek = jest.fn();

    render(
      <WeekNavigator
        weekAnchor={createTestDate(0)}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
        onOpenWeekPicker={jest.fn()}
      />
    );

    fireEvent.press(screen.getByLabelText('Previous week'));
    fireEvent.press(screen.getByLabelText('Next week'));

    expect(onPreviousWeek).toHaveBeenCalledTimes(1);
    expect(onNextWeek).toHaveBeenCalledTimes(1);
  });
});
