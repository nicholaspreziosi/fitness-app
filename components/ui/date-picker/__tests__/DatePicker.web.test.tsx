import { DatePicker } from '@/components/ui/date-picker/DatePicker.web';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';

function pressDay(label: RegExp) {
  const match = screen.UNSAFE_root.findAll(
    (node) => typeof node.props?.['aria-label'] === 'string' && label.test(node.props['aria-label'])
  )[0] as ReactTestInstance | undefined;

  if (!match?.props.onClick) {
    throw new Error(`No day matching ${label}`);
  }

  act(() => {
    match.props.onClick({ preventDefault() {}, stopPropagation() {} });
  });
}

describe('DatePicker web', () => {
  const value = new Date(2025, 5, 18, 15, 0);

  it('confirms the date chosen on the calendar', () => {
    const onConfirm = jest.fn();

    render(
      <DatePicker value={value} onConfirm={onConfirm} onCancel={jest.fn()} confirmLabel="Go" />
    );

    pressDay(/June 20th, 2025$/);
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
