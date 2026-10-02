import { ComboboxMultiSelect } from '@/src/ui/shared/components/ComboboxMultiSelect';
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
  { label: 'Core', value: 'core' },
  { label: 'Back', value: 'back' },
];

describe('ComboboxMultiSelect', () => {
  it('opens a sheet, toggles options, and keeps the sheet open until Done', () => {
    const onChange = jest.fn();

    render(
      <ComboboxMultiSelect
        label="Body parts"
        options={options}
        value={['core']}
        placeholder="Select body parts"
        onChange={onChange}
      />
    );

    fireEvent.press(screen.getByRole('button', { name: 'Select body parts' }));
    expect(screen.getByTestId('combobox-sheet')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Back'));
    expect(onChange).toHaveBeenCalledWith(['core', 'back']);
    expect(screen.getByTestId('combobox-sheet')).toBeTruthy();

    fireEvent.press(screen.getByText('Done'));
    expect(screen.queryByTestId('combobox-sheet')).toBeNull();
  });
});
