import { CompletionDonutChart } from '@/src/ui/dashboard/components/CompletionDonutChart';
import { render, screen } from '@testing-library/react-native';

describe('CompletionDonutChart', () => {
  it('renders percentage and completed label', () => {
    render(<CompletionDonutChart percentage={75} />);

    expect(screen.getByTestId('completion-donut-chart')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
  });

  it('shows empty chart state', () => {
    render(<CompletionDonutChart percentage={0} isEmpty />);

    expect(screen.getByTestId('completion-donut-chart-empty')).toBeTruthy();
    expect(screen.getByText('Complete workouts to see training coverage.')).toBeTruthy();
  });
});
