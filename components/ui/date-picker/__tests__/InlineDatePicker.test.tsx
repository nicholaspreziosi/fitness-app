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

  it('renders the system inline calendar with brand accent', () => {
    render(<InlineDatePicker value={value} onChange={jest.fn()} />);

    const picker = screen.getByTestId('date-time-picker');
    expect(picker.props.display).toBe('inline');
    expect(picker.props.mode).toBe('date');
    expect(picker.props.value).toEqual(value);
    expect(picker.props.accentColor).toBe('hsl(84 81% 44%)');
  });

  it('reports the picked day without a time component', () => {
    const onChange = jest.fn();

    render(<InlineDatePicker value={value} onChange={onChange} />);

    fireEvent(
      screen.getByTestId('date-time-picker'),
      'change',
      { type: 'set' },
      new Date(2025, 5, 25, 9, 30)
    );

    expect(onChange).toHaveBeenCalledWith(startOfDay(new Date(2025, 5, 25)));
  });

  it('ignores dismissals', () => {
    const onChange = jest.fn();

    render(<InlineDatePicker value={value} onChange={onChange} />);

    fireEvent(screen.getByTestId('date-time-picker'), 'change', { type: 'dismissed' }, undefined);

    expect(onChange).not.toHaveBeenCalled();
  });
});
