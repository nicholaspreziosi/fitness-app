import { DatePicker } from '@/components/ui/date-picker';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    __esModule: true,
    default: ({
      onChange,
      value,
      accentColor,
    }: {
      onChange?: (event: unknown, date?: Date) => void;
      value: Date;
      accentColor?: string;
    }) => (
      <Pressable
        accessibilityLabel={accentColor}
        testID="date-time-picker"
        onPress={() => onChange?.({}, new Date(2025, 5, 20, 15, 30))}>
        <Text>{value.toISOString()}</Text>
      </Pressable>
    ),
  };
});

describe('DatePicker', () => {
  const value = new Date(2025, 5, 18, 15, 0);

  it('confirms the selected day without a time component', () => {
    const onConfirm = jest.fn();

    render(<DatePicker value={value} onConfirm={onConfirm} onCancel={jest.fn()} />);

    fireEvent.press(screen.getByText('Confirm'));

    expect(onConfirm).toHaveBeenCalledWith(startOfDay(value));
    expect(screen.getByTestId('date-time-picker').props.accessibilityLabel).toBe('hsl(84 81% 44%)');
  });

  it('confirms a newly picked day', () => {
    const onConfirm = jest.fn();

    render(<DatePicker value={value} onConfirm={onConfirm} onCancel={jest.fn()} />);

    fireEvent.press(screen.getByTestId('date-time-picker'));
    fireEvent.press(screen.getByText('Confirm'));

    expect(onConfirm).toHaveBeenCalledWith(startOfDay(new Date(2025, 5, 20, 15, 30)));
  });

  it('cancels without confirming', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(<DatePicker value={value} onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.press(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
