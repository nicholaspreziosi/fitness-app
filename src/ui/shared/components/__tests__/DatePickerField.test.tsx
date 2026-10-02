import {
  DATE_PICKER_SHEET_HANDOFF_MS,
  DatePickerField,
} from '@/src/ui/shared/components/DatePickerField';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('@/src/ui/shared/providers/RefreshGuardProvider', () => ({
  useRefreshGuardFlag: jest.fn(),
}));

jest.mock('@/components/ui/date-picker', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    InlineDatePicker: ({ value, onChange }: { value: Date; onChange: (date: Date) => void }) => (
      <Pressable testID="inline-date-picker" onPress={() => onChange(new Date(2024, 6, 3))}>
        <Text>{`Picker at ${value.toISOString().slice(0, 10)}`}</Text>
      </Pressable>
    ),
  };
});

describe('DatePickerField', () => {
  const value = new Date(2024, 5, 18, 12, 0);

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the selected date and keeps the sheet closed until tapped', () => {
    render(<DatePickerField value={value} onChange={jest.fn()} />);

    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
    expect(screen.queryByTestId('inline-date-picker')).toBeNull();
  });

  it('opens an inline picker sheet and applies the day after the sheet closes', () => {
    jest.useFakeTimers();
    const onChange = jest.fn();

    render(<DatePickerField value={value} onChange={onChange} />);

    fireEvent.press(screen.getByRole('button'));
    expect(screen.getByText('Picker at 2024-06-18')).toBeTruthy();

    fireEvent.press(screen.getByTestId('inline-date-picker'));

    expect(screen.queryByTestId('inline-date-picker')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(DATE_PICKER_SHEET_HANDOFF_MS);
    });

    expect(onChange).toHaveBeenCalledWith(new Date(2024, 6, 3));
    jest.useRealTimers();
  });

  it('stays closed when disabled', () => {
    render(<DatePickerField value={value} onChange={jest.fn()} disabled />);

    fireEvent.press(screen.getByRole('button'));

    expect(screen.queryByTestId('inline-date-picker')).toBeNull();
  });
});
