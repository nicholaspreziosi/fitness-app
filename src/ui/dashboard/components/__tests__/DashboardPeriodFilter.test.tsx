import { DashboardPeriodFilter } from '@/src/ui/dashboard/components/DashboardPeriodFilter';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('DashboardPeriodFilter', () => {
  it('renders all period options and defaults to this week', () => {
    const onChange = jest.fn();

    render(<DashboardPeriodFilter value="thisWeek" onChange={onChange} />);

    expect(screen.getByTestId('dashboard-period-filter')).toBeTruthy();
    expect(screen.getByText('This Week')).toBeTruthy();
    expect(screen.getByText('Next Week')).toBeTruthy();
    expect(screen.getByText('This Month')).toBeTruthy();
  });

  it('calls onChange when a different period is selected', () => {
    const onChange = jest.fn();

    render(<DashboardPeriodFilter value="thisWeek" onChange={onChange} />);

    fireEvent.press(screen.getByTestId('dashboard-period-filter-nextWeek'));

    expect(onChange).toHaveBeenCalledWith('nextWeek');
  });
});
