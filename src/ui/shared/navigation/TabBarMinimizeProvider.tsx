import {
  expandTabBarScroll,
  initialTabBarScrollState,
  reduceTabBarScroll,
  syncTabBarScroll,
  type TabBarScrollState,
} from '@/src/ui/shared/navigation/tabBarMinimize';
import * as React from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type TabBarMinimizeContextValue = {
  minimized: boolean;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  expand: () => void;
  syncScrollPosition: (scrollTop: number) => void;
};

const TabBarMinimizeContext = React.createContext<TabBarMinimizeContextValue | null>(null);

export function TabBarMinimizeProvider({ children }: { children: React.ReactNode }) {
  const [minimized, setMinimized] = React.useState(false);
  const stateRef = React.useRef<TabBarScrollState>(initialTabBarScrollState);

  const commit = React.useCallback((next: TabBarScrollState) => {
    stateRef.current = next;
    setMinimized((current) => (current === next.minimized ? current : next.minimized));
  }, []);

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      commit(reduceTabBarScroll(stateRef.current, event.nativeEvent.contentOffset.y));
    },
    [commit]
  );

  const expand = React.useCallback(() => {
    commit(expandTabBarScroll(stateRef.current));
  }, [commit]);

  const syncScrollPosition = React.useCallback(
    (scrollTop: number) => {
      commit(syncTabBarScroll(stateRef.current, scrollTop));
    },
    [commit]
  );

  const value = React.useMemo(
    () => ({
      minimized,
      handleScroll,
      expand,
      syncScrollPosition,
    }),
    [expand, handleScroll, minimized, syncScrollPosition]
  );

  return <TabBarMinimizeContext.Provider value={value}>{children}</TabBarMinimizeContext.Provider>;
}

export function useTabBarMinimize() {
  const context = React.useContext(TabBarMinimizeContext);

  if (!context) {
    throw new Error('useTabBarMinimize must be used within TabBarMinimizeProvider');
  }

  return context;
}

export function useOptionalTabBarMinimize() {
  return React.useContext(TabBarMinimizeContext);
}
