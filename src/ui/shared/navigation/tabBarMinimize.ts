/** Downward travel before the bar collapses. Small bumps should not minimize it. */
export const TAB_BAR_MINIMIZE_THRESHOLD_PX = 48;

/** Near the top of the screen the bar is always expanded. */
export const TAB_BAR_TOP_EXPAND_PX = 10;

export type TabBarScrollState = {
  lastScrollY: number;
  scrollDelta: number;
  minimized: boolean;
};

export const initialTabBarScrollState: TabBarScrollState = {
  lastScrollY: 0,
  scrollDelta: 0,
  minimized: false,
};

export function reduceTabBarScroll(state: TabBarScrollState, scrollTop: number): TabBarScrollState {
  const y = Math.max(0, scrollTop);
  const delta = y - state.lastScrollY;

  if (Math.abs(delta) < 1) {
    return { ...state, lastScrollY: y };
  }

  if (y <= TAB_BAR_TOP_EXPAND_PX) {
    return { lastScrollY: y, scrollDelta: 0, minimized: false };
  }

  if (delta > 0) {
    const scrollDelta = state.scrollDelta + delta;

    if (scrollDelta >= TAB_BAR_MINIMIZE_THRESHOLD_PX) {
      return { lastScrollY: y, scrollDelta: 0, minimized: true };
    }

    return { ...state, lastScrollY: y, scrollDelta };
  }

  // Scrolling up does not expand the bar. Only the top of the screen or a tap does.
  return { ...state, lastScrollY: y, scrollDelta: 0 };
}

export function expandTabBarScroll(state: TabBarScrollState): TabBarScrollState {
  return { ...state, scrollDelta: 0, minimized: false };
}

export function syncTabBarScroll(state: TabBarScrollState, scrollTop: number): TabBarScrollState {
  const y = Math.max(0, scrollTop);

  if (y <= TAB_BAR_TOP_EXPAND_PX) {
    return { lastScrollY: y, scrollDelta: 0, minimized: false };
  }

  return { ...state, lastScrollY: y, scrollDelta: 0 };
}
