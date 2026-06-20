import { CoverageBarChart } from '@/src/ui/dashboard/components/CoverageBarChart';
import { render, screen } from '@testing-library/react-native';

describe('CoverageBarChart', () => {
  it('renders body part coverage rows', () => {
    render(
      <CoverageBarChart
        coverage={[
          { bodyPart: 'Quads', count: 6 },
          { bodyPart: 'Shoulders', count: 4 },
        ]}
      />
    );

    expect(screen.getByTestId('coverage-bar-chart')).toBeTruthy();
    expect(screen.getByText('Most Hit Body Parts')).toBeTruthy();
    expect(screen.getByText('Quads')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('Shoulders')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('shows empty chart state', () => {
    render(<CoverageBarChart coverage={[]} isEmpty />);

    expect(screen.getByTestId('coverage-bar-chart-empty')).toBeTruthy();
    expect(screen.getByText('Complete workouts to see training coverage.')).toBeTruthy();
  });
});
