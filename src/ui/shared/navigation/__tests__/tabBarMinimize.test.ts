import {
  expandTabBarScroll,
  initialTabBarScrollState,
  reduceTabBarScroll,
  syncTabBarScroll,
  type TabBarScrollState,
} from '@/src/ui/shared/navigation/tabBarMinimize';

function scroll(state: TabBarScrollState, y: number) {
  return reduceTabBarScroll(state, y);
}

describe('reduceTabBarScroll', () => {
  it('minimizes after scrolling down past the threshold', () => {
    let state = initialTabBarScrollState;
    state = scroll(state, 20);
    state = scroll(state, 80);

    expect(state.minimized).toBe(true);
  });

  it('stays minimized while scrolling up away from the top', () => {
    let state = scroll(scroll(initialTabBarScrollState, 20), 100);

    state = scroll(state, 60);
    state = scroll(state, 30);

    expect(state.minimized).toBe(true);
  });

  it('expands at the top of the screen', () => {
    let state = scroll(scroll(initialTabBarScrollState, 20), 100);

    state = scroll(state, 4);

    expect(state.minimized).toBe(false);
  });

  it('ignores tiny scroll deltas', () => {
    const state = scroll(scroll(initialTabBarScrollState, 40), 40.4);

    expect(state.minimized).toBe(false);
    expect(state.scrollDelta).toBe(40);
  });
});

describe('expandTabBarScroll', () => {
  it('expands without treating the next small scroll as a fresh collapse', () => {
    const minimized = scroll(scroll(initialTabBarScrollState, 20), 100);
    const expanded = expandTabBarScroll(minimized);
    const next = scroll(expanded, 110);

    expect(expanded.minimized).toBe(false);
    expect(next.minimized).toBe(false);
  });
});

describe('syncTabBarScroll', () => {
  it('expands when the focused screen is at the top', () => {
    const minimized = scroll(scroll(initialTabBarScrollState, 20), 100);

    expect(syncTabBarScroll(minimized, 0).minimized).toBe(false);
  });

  it('keeps the current state when the focused screen is scrolled', () => {
    const minimized = scroll(scroll(initialTabBarScrollState, 20), 100);

    expect(syncTabBarScroll(minimized, 240).minimized).toBe(true);
    expect(syncTabBarScroll(initialTabBarScrollState, 240).minimized).toBe(false);
  });
});
