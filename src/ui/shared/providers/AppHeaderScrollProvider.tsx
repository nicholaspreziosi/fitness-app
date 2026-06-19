import { APP_HEADER_BAR_HEIGHT } from '@/src/ui/shared/constants/appHeader';
import * as React from 'react';
import {
  Easing,
  runOnUI,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCROLL_THRESHOLD_PX = 128;

type AppHeaderScrollContextValue = {
  headerTranslateY: SharedValue<number>;
  headerHeight: number;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  resetHeaderScroll: (scrollY: number) => void;
};

const AppHeaderScrollContext = React.createContext<AppHeaderScrollContextValue | null>(null);

export function AppHeaderScrollProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + APP_HEADER_BAR_HEIGHT;
  const headerHeightShared = useSharedValue(headerHeight);
  const headerTranslateY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const scrollDelta = useSharedValue(0);
  const lastDirection = useSharedValue(0);
  const isHidden = useSharedValue(0);

  React.useEffect(() => {
    headerHeightShared.value = headerHeight;
    if (isHidden.value === 1) {
      headerTranslateY.value = -headerHeight;
    }
  }, [headerHeight, headerHeightShared, headerTranslateY, isHidden]);

  const resetHeaderScroll = React.useCallback(
    (scrollY: number) => {
      runOnUI((y: number) => {
        'worklet';
        lastScrollY.value = y;
        scrollDelta.value = 0;
        lastDirection.value = 0;
        isHidden.value = 0;
        headerTranslateY.value = 0;
      })(scrollY);
    },
    [headerTranslateY, isHidden, lastDirection, lastScrollY, scrollDelta]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      const scrollTop = Math.max(0, event.contentOffset.y);
      const delta = scrollTop - lastScrollY.value;

      if (Math.abs(delta) < 1) {
        lastScrollY.value = scrollTop;
        return;
      }

      if (scrollTop <= 10) {
        if (isHidden.value === 1) {
          isHidden.value = 0;
          headerTranslateY.value = withTiming(0, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
        }
        scrollDelta.value = 0;
        lastDirection.value = 0;
      } else if (delta > 0) {
        if (lastDirection.value !== 1) {
          lastDirection.value = 1;
          scrollDelta.value = 0;
        }

        scrollDelta.value += delta;

        if (scrollDelta.value >= SCROLL_THRESHOLD_PX && isHidden.value === 0) {
          isHidden.value = 1;
          headerTranslateY.value = withTiming(-headerHeightShared.value, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
          scrollDelta.value = 0;
        }
      } else if (delta < 0) {
        if (lastDirection.value !== -1) {
          lastDirection.value = -1;
          scrollDelta.value = 0;
        }

        scrollDelta.value += Math.abs(delta);

        if (scrollDelta.value >= SCROLL_THRESHOLD_PX && isHidden.value === 1) {
          isHidden.value = 0;
          headerTranslateY.value = withTiming(0, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
          scrollDelta.value = 0;
        }
      }

      lastScrollY.value = scrollTop;
    },
  });

  const value = React.useMemo(
    () => ({
      headerTranslateY,
      headerHeight,
      scrollHandler,
      resetHeaderScroll,
    }),
    [headerHeight, headerTranslateY, resetHeaderScroll, scrollHandler]
  );

  return (
    <AppHeaderScrollContext.Provider value={value}>{children}</AppHeaderScrollContext.Provider>
  );
}

export function useAppHeaderScroll() {
  const context = React.useContext(AppHeaderScrollContext);

  if (!context) {
    throw new Error('useAppHeaderScroll must be used within AppHeaderScrollProvider');
  }

  return context;
}

export function useOptionalAppHeaderScroll() {
  return React.useContext(AppHeaderScrollContext);
}
