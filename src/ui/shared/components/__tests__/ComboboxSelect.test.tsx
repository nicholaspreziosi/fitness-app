import { ComboboxSelect } from '@/src/ui/shared/components/ComboboxSelect';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('@/src/ui/shared/components/BottomSheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BottomSheet: ({
      visible,
      children,
    }: {
      visible: boolean;
      children: React.ReactNode;
    }) => (visible ? <View testID="combobox-sheet">{children}</View> : null),
  };
});

const options = [
  { label: 'Barbell', value: 'barbell' },
  { label: 'Dumbbell', value: 'dumbbell' },
];

describe('ComboboxSelect', () => {
  it('opens a sheet and selects an option', () => {
    const onChange = jest.fn();

    render(
      <ComboboxSelect
        label="Equipment"
        options={options}
        placeholder="Select equipment"
        onChange={onChange}
      />
    );

    expect(screen.queryByTestId('combobox-sheet')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Select equipment' }));
    expect(screen.getByTestId('combobox-sheet')).toBeTruthy();

    fireEvent.press(screen.getByText('Dumbbell'));

    expect(onChange).toHaveBeenCalledWith('dumbbell');
    expect(screen.queryByTestId('combobox-sheet')).toBeNull();
  });
});
