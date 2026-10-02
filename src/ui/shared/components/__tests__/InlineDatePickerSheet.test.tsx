import { InlineDatePickerSheet } from '@/src/ui/shared/components/InlineDatePickerSheet';
import { fireEvent, render, screen } from '@testing-library/react-native';

const pickedDate = new Date(2025, 5, 25);

jest.mock('@/components/ui/date-picker', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    InlineDatePicker: ({ value, onChange }: { value: Date; onChange: (date: Date) => void }) => (
      <Pressable testID="inline-date-picker" onPress={() => onChange(new Date(2025, 5, 25))}>
        <Text>{value.toISOString()}</Text>
      </Pressable>
    ),
  };
});

describe('InlineDatePickerSheet', () => {
  const value = new Date(2025, 5, 18);

  it('shows the inline picker for the current value', () => {
    render(<InlineDatePickerSheet value={value} onSelect={jest.fn()} />);

    expect(screen.queryByText('Go to Week')).toBeNull();
    expect(screen.getByText(value.toISOString())).toBeTruthy();
  });

  it('selects a day as soon as it is tapped', () => {
    const onSelect = jest.fn();

    render(<InlineDatePickerSheet value={value} onSelect={onSelect} />);

    fireEvent.press(screen.getByTestId('inline-date-picker'));

    expect(onSelect).toHaveBeenCalledWith(pickedDate);
  });
});
