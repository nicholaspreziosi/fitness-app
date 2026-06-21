import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { render, screen } from '@testing-library/react-native';

describe('LoadingState', () => {
  it('renders an inline spinner below surrounding content', () => {
    render(<LoadingState />);

    expect(screen.getByTestId('loading-state')).toBeTruthy();
    expect(screen.getByLabelText('loading')).toBeTruthy();
  });
});
