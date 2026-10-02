import { InlineDatePicker } from '@/components/ui/date-picker/InlineDatePicker.web';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('InlineDatePicker web', () => {
  const value = new Date(2025, 5, 18, 15, 0);

  it('renders a date input bound to the value', () => {
    render(<InlineDatePicker value={value} onChange={jest.fn()} />);

    const input = screen.getByLabelText('Date');
    expect(input.props.type).toBe('date');
    expect(input.props.value).toBe('2025-06-18');
    expect(input.props.className).toContain('accent-brand');
  });

  it('reports the date chosen in the input', () => {
    const onChange = jest.fn();

    render(<InlineDatePicker value={value} onChange={onChange} />);

    fireEvent(screen.getByLabelText('Date'), 'change', {
      currentTarget: { value: '2025-06-25' },
    });

    expect(onChange).toHaveBeenCalledWith(startOfDay(new Date(2025, 5, 25)));
  });
});
