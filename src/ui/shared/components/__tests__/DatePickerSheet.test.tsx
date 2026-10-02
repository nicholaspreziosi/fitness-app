import { render, screen, fireEvent } from '@testing-library/react-native';
import { DatePickerSheet } from '@/src/ui/shared/components/DatePickerSheet';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="date-time-picker" />,
  };
});

describe('DatePickerSheet', () => {
  it('defaults to today and confirms selected date', () => {
    const onConfirm = jest.fn();
    const today = new Date('2025-06-18T12:00:00.000Z');

    render(
      <DatePickerSheet
        title="Select Date"
        value={today}
        onConfirm={onConfirm}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Select Date')).toBeTruthy();
    fireEvent.press(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledWith(expect.any(Date));
  });

  it('cancels without confirming the date', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    render(
      <DatePickerSheet
        title="Select Date"
        value={new Date('2025-06-18T12:00:00.000Z')}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    fireEvent.press(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
