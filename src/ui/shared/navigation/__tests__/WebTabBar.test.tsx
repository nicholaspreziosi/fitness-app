import { render } from '@testing-library/react-native';
import * as React from 'react';

type RecordedScreen = {
  name?: string;
  title?: string;
};

const recordedTabsProps: Record<string, unknown>[] = [];
const recordedScreens: RecordedScreen[] = [];

jest.mock('expo-router', () => {
  function Screen({ name, options }: { name?: string; options?: { title?: string } }) {
    recordedScreens.push({ name, title: options?.title });
    return null;
  }

  function Tabs(props: { children?: React.ReactNode }) {
    recordedTabsProps.push(props);
    return props.children ?? null;
  }

  Tabs.Screen = Screen;

  return {
    Tabs,
    DarkTheme: { colors: {} },
    DefaultTheme: { colors: {} },
  };
});

jest.mock('expo-router/unstable-native-tabs', () => ({
  NativeTabs: jest.fn(() => null),
}));

import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { WebTabBar } from '@/src/ui/shared/navigation/WebTabBar';

describe('WebTabBar', () => {
  beforeEach(() => {
    recordedTabsProps.length = 0;
    recordedScreens.length = 0;
    jest.mocked(NativeTabs).mockClear();
  });

  it('keeps the five web tabs and does not use native tabs', () => {
    render(<WebTabBar />);

    expect(recordedTabsProps[0]).toEqual(
      expect.objectContaining({
        initialRouteName: 'home',
      })
    );
    expect(recordedScreens).toEqual([
      { name: 'home', title: 'Dashboard' },
      { name: 'calendar', title: 'Calendar' },
      { name: 'workout', title: 'Workout' },
      { name: 'library', title: 'Library' },
      { name: 'settings', title: 'Settings' },
    ]);
    expect(NativeTabs).not.toHaveBeenCalled();
  });
});
