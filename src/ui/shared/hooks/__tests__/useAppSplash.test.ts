import { act, renderHook } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';

import { SPLASH_MIN_DURATION_MS, useAppSplash } from '@/src/ui/shared/hooks/useAppSplash';

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('useAppSplash', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    Platform.OS = 'ios';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps splash visible until auth is ready and the minimum duration passes', () => {
    const { result, rerender } = renderHook(({ ready }) => useAppSplash(ready), {
      initialProps: { ready: false },
    });

    expect(result.current.showSplash).toBe(true);

    rerender({ ready: true });
    expect(result.current.showSplash).toBe(true);

    act(() => {
      jest.advanceTimersByTime(SPLASH_MIN_DURATION_MS);
    });

    expect(result.current.showSplash).toBe(false);
  });

  it('hides the native splash when the splash view is ready', () => {
    const { result } = renderHook(() => useAppSplash(false));

    result.current.onSplashReady();

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it('skips splash on web', () => {
    Platform.OS = 'web';

    const { result } = renderHook(() => useAppSplash(false));

    expect(result.current.showSplash).toBe(false);

    result.current.onSplashReady();

    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });
});
