import { InlineDatePicker } from '@/components/ui/date-picker/InlineDatePicker.web';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';

function pressControl(label: string | RegExp) {
  const match = screen.UNSAFE_root.findAll((node) => {
    const ariaLabel = node.props?.['aria-label'];
    if (typeof ariaLabel !== 'string') {
      return false;
    }
    return typeof label === 'string' ? ariaLabel === label : label.test(ariaLabel);
  })[0] as ReactTestInstance | undefined;

  if (!match?.props.onClick) {
    throw new Error(`No control matching ${label}`);
  }

  act(() => {
    match.props.onClick({ preventDefault() {}, stopPropagation() {} });
  });
}

function pressDay(label: RegExp) {
  pressControl(label);
}

describe('InlineDatePicker web', () => {
  const value = new Date(2025, 5, 18, 15, 0);

  it('renders an inline month grid for the selected date', () => {
    render(<InlineDatePicker value={value} onChange={jest.fn()} />);

    expect(
      screen.UNSAFE_root.findAll((node) => node.props?.['aria-label'] === 'June 2025').length
    ).toBeGreaterThan(0);
    expect(
      screen.UNSAFE_root.findAll(
        (node) => node.props?.['aria-label'] === 'Wednesday, June 18th, 2025, selected'
      ).length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('confirms the current date when no other day is chosen', () => {
    const onChange = jest.fn();

    render(<InlineDatePicker value={value} onChange={onChange} />);

    fireEvent.press(screen.getByText('Confirm'));

    expect(onChange).toHaveBeenCalledWith(startOfDay(value));
  });

  it('moves to the next and previous month from the arrows', () => {
    render(<InlineDatePicker value={value} onChange={jest.fn()} />);

    pressControl('Next month');

    expect(
      screen.UNSAFE_root.findAll((node) => node.props?.['aria-label'] === 'July 2025').length
    ).toBeGreaterThan(0);

    pressControl('Previous month');

    expect(
      screen.UNSAFE_root.findAll((node) => node.props?.['aria-label'] === 'June 2025').length
    ).toBeGreaterThan(0);
  });

  it('picks a month and year from the wheels', () => {
    render(<InlineDatePicker value={value} onChange={jest.fn()} />);

    pressControl('Choose month and year');

    expect(
      screen.UNSAFE_root.findAll((node) => node.props?.['aria-label'] === 'Next month').length
    ).toBe(0);

    const thisYear = new Date().getFullYear();
    expect(
      screen.UNSAFE_root.findAll((node) => node.props?.['aria-label'] === String(thisYear - 6))
        .length
    ).toBe(0);
    expect(
      screen.UNSAFE_root.findAll((node) => node.props?.['aria-label'] === String(thisYear + 5))
        .length
    ).toBeGreaterThan(0);

    pressControl('March');
    pressControl('2026');
    pressControl('Show days');

    expect(
      screen.UNSAFE_root.findAll((node) => node.props?.['aria-label'] === 'March 2026').length
    ).toBeGreaterThan(0);
  });

  it('confirms a newly picked day', () => {
    const onChange = jest.fn();

    render(<InlineDatePicker value={value} onChange={onChange} />);

    pressDay(/June 25th, 2025$/);
    fireEvent.press(screen.getByText('Confirm'));

    expect(onChange).toHaveBeenCalledWith(startOfDay(new Date(2025, 5, 25)));
  });
});
