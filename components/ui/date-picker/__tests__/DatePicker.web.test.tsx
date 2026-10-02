import { DatePicker } from '@/components/ui/date-picker/DatePicker.web';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('DatePicker web', () => {
  const value = new Date(2025, 5, 18, 15, 0);

  it('confirms the date chosen in the web input', () => {
    const onConfirm = jest.fn();

    render(
      <DatePicker value={value} onConfirm={onConfirm} onCancel={jest.fn()} confirmLabel="Go" />
    );

    fireEvent(screen.getByLabelText('Date'), 'change', {
      currentTarget: { value: '2025-06-20' },
    });
    expect(screen.getByLabelText('Date').props.className).toContain('accent-brand');
    fireEvent.press(screen.getByText('Go'));

    expect(onConfirm).toHaveBeenCalledWith(startOfDay(new Date(2025, 5, 20)));
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
