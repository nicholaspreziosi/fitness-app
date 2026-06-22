import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Platform } from 'react-native';

export const SPLASH_MIN_DURATION_MS = 1500;

export function useAppSplash(ready: boolean) {
  const isNative = Platform.OS !== 'web';
  const [minDurationElapsed, setMinDurationElapsed] = React.useState(!isNative);

  React.useEffect(() => {
    if (!isNative) {
      return;
    }

    const timer = setTimeout(() => setMinDurationElapsed(true), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isNative]);

  const onSplashReady = React.useCallback(() => {
    if (!isNative) {
      return;
    }

    SplashScreen.hideAsync().catch(() => undefined);
  }, [isNative]);

  return {
    onSplashReady,
    showSplash: isNative && (!ready || !minDurationElapsed),
  };
}
