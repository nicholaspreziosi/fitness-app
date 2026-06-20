import { DashboardStatCard } from '@/src/ui/dashboard/components/DashboardStatCard';
import { render, screen } from '@testing-library/react-native';

describe('DashboardStatCard', () => {
  it('renders completed and total counts with label', () => {
    render(<DashboardStatCard completed={3} total={4} label="Workouts" testID="workout-stat" />);

    expect(screen.getByTestId('workout-stat')).toBeTruthy();
    expect(screen.getByText('3 / 4')).toBeTruthy();
    expect(screen.getByText('Workouts')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
  });
});
