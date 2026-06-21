jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

import { SplashView } from '@/src/ui/shared/components/SplashView';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('SplashView', () => {
  it('renders the Flow logo on a full-screen background', () => {
    render(<SplashView />);

    expect(screen.getByTestId('splash-screen')).toBeTruthy();
    expect(screen.getByText('Flow')).toBeTruthy();
  });

  it('notifies when the splash layout is ready', () => {
    const onReady = jest.fn();

    render(<SplashView onReady={onReady} />);

    fireEvent(screen.getByTestId('splash-screen'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 844 } },
    });

    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
