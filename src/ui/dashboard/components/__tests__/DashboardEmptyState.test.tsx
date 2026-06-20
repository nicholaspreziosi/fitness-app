import { DashboardEmptyState } from '@/src/ui/dashboard/components/DashboardEmptyState';
import { render, screen } from '@testing-library/react-native';

describe('DashboardEmptyState', () => {
  it('renders the provided message', () => {
    render(
      <DashboardEmptyState testID="dashboard-empty" message="No workouts planned for this period." />
    );

    expect(screen.getByTestId('dashboard-empty')).toBeTruthy();
    expect(screen.getByText('No workouts planned for this period.')).toBeTruthy();
  });
});
