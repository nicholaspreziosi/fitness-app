import { MonthNavigator } from '@/src/ui/shared/components/MonthNavigator';
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

describe('MonthNavigator', () => {
  it('renders the month label and navigation controls', () => {
    render(
      <MonthNavigator
        monthAnchor={createTestDate(0)}
        onPreviousMonth={jest.fn()}
        onNextMonth={jest.fn()}
        onOpenMonthPicker={jest.fn()}
      />
    );

    expect(screen.getByTestId('month-navigator')).toBeTruthy();
    expect(screen.getByText('June 2024')).toBeTruthy();
  });

  it('calls navigation handlers', () => {
    const onPreviousMonth = jest.fn();
    const onNextMonth = jest.fn();
    const onOpenMonthPicker = jest.fn();

    render(
      <MonthNavigator
        monthAnchor={createTestDate(0)}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onOpenMonthPicker={onOpenMonthPicker}
      />
    );

    fireEvent.press(screen.getByTestId('month-navigator-previous'));
    fireEvent.press(screen.getByTestId('month-navigator-next'));
    fireEvent.press(screen.getByTestId('month-navigator-label'));

    expect(onPreviousMonth).toHaveBeenCalledTimes(1);
    expect(onNextMonth).toHaveBeenCalledTimes(1);
    expect(onOpenMonthPicker).toHaveBeenCalledTimes(1);
  });
});
