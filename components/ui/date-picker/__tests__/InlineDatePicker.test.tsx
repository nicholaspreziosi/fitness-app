import { InlineDatePicker } from '@/components/ui/date-picker';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View testID="date-time-picker" {...props} />,
  };
});

describe('InlineDatePicker (iOS)', () => {
  const value = new Date(2025, 5, 18, 15, 0);

  it('renders the system inline calendar with a confirm action', () => {
    render(<InlineDatePicker value={value} onChange={jest.fn()} />);

    const picker = screen.getByTestId('date-time-picker');
    expect(picker.props.display).toBe('inline');
    expect(picker.props.mode).toBe('date');
    expect(picker.props.value).toEqual(startOfDay(value));
    expect(picker.props.accentColor).toBe('hsl(84 81% 44%)');
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('confirms the current date when the picker never fires a change', () => {
    const onChange = jest.fn();

    render(<InlineDatePicker value={value} onChange={onChange} />);

    fireEvent.press(screen.getByText('Confirm'));

    expect(onChange).toHaveBeenCalledWith(startOfDay(value));
  });

  it('confirms a newly picked day', () => {
    const onChange = jest.fn();

    render(<InlineDatePicker value={value} onChange={onChange} />);

    fireEvent(
      screen.getByTestId('date-time-picker'),
      'change',
      { type: 'set' },
      new Date(2025, 5, 25, 9, 30)
    );
    fireEvent.press(screen.getByText('Confirm'));

    expect(onChange).toHaveBeenCalledWith(startOfDay(new Date(2025, 5, 25)));
  });

  it('ignores dismissals', () => {
    const onChange = jest.fn();

    render(<InlineDatePicker value={value} onChange={onChange} />);

    fireEvent(screen.getByTestId('date-time-picker'), 'change', { type: 'dismissed' }, undefined);
    fireEvent.press(screen.getByText('Confirm'));

    expect(onChange).toHaveBeenCalledWith(startOfDay(value));
  });
});
