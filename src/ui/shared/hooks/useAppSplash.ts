import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';

export const SPLASH_MIN_DURATION_MS = 1500;

export function useAppSplash(ready: boolean) {
  const [minDurationElapsed, setMinDurationElapsed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMinDurationElapsed(true), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  const onSplashReady = React.useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return {
    onSplashReady,
    showSplash: !ready || !minDurationElapsed,
  };
}
