import * as React from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/** Pixels to scroll before hiding (down) or showing (up) the header. Reduces flicker. */
const SCROLL_THRESHOLD_PX = 64;

export function useScrollDirection(onVisibilityChange: (visible: boolean) => void) {
  const lastScrollY = React.useRef(0);
  const scrollDelta = React.useRef(0);
  const lastDirection = React.useRef<'up' | 'down' | null>(null);
  const headerVisibleRef = React.useRef(true);
  const onVisibilityChangeRef = React.useRef(onVisibilityChange);

  onVisibilityChangeRef.current = onVisibilityChange;

  const setHeaderVisible = React.useCallback((visible: boolean) => {
    if (headerVisibleRef.current === visible) {
      return;
    }

    headerVisibleRef.current = visible;
    onVisibilityChangeRef.current(visible);
  }, []);

  const handleScroll = React.useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollTop = Math.max(0, event.nativeEvent.contentOffset.y);
    const delta = scrollTop - lastScrollY.current;

    if (Math.abs(delta) >= 1) {
      if (scrollTop <= 10) {
        setHeaderVisible(true);
        scrollDelta.current = 0;
        lastDirection.current = null;
      } else if (delta > 0) {
        if (lastDirection.current !== 'down') {
          lastDirection.current = 'down';
          scrollDelta.current = 0;
        }

        scrollDelta.current += delta;

        if (scrollDelta.current >= SCROLL_THRESHOLD_PX) {
          setHeaderVisible(false);
          scrollDelta.current = 0;
        }
      } else if (delta < 0) {
        if (lastDirection.current !== 'up') {
          lastDirection.current = 'up';
          scrollDelta.current = 0;
        }

        scrollDelta.current += Math.abs(delta);

        if (scrollDelta.current >= SCROLL_THRESHOLD_PX) {
          setHeaderVisible(true);
          scrollDelta.current = 0;
        }
      }
    }

    lastScrollY.current = scrollTop;
  }, [setHeaderVisible]);

  const showHeader = React.useCallback(() => {
    scrollDelta.current = 0;
    lastDirection.current = null;
    setHeaderVisible(true);
  }, [setHeaderVisible]);

  const syncScrollPosition = React.useCallback((scrollTop: number) => {
    lastScrollY.current = Math.max(0, scrollTop);
    scrollDelta.current = 0;
    lastDirection.current = null;
  }, []);

  return { handleScroll, showHeader, syncScrollPosition };
}
