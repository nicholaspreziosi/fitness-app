import { DashboardViewModeFilter } from '@/src/ui/dashboard/components/DashboardViewModeFilter';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('DashboardViewModeFilter', () => {
  it('renders week and month options', () => {
    const onChange = jest.fn();

    render(<DashboardViewModeFilter value="week" onChange={onChange} />);

    expect(screen.getByTestId('dashboard-view-mode-filter')).toBeTruthy();
    expect(screen.getByText('Week')).toBeTruthy();
    expect(screen.getByText('Month')).toBeTruthy();
  });

  it('calls onChange when month is selected', () => {
    const onChange = jest.fn();

    render(<DashboardViewModeFilter value="week" onChange={onChange} />);

    fireEvent.press(screen.getByTestId('dashboard-view-mode-filter-month'));

    expect(onChange).toHaveBeenCalledWith('month');
  });
});
