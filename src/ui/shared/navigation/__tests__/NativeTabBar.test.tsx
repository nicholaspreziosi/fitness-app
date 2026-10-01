import { THEME } from '@/lib/theme';
import { nativeTabTriggers } from '@/src/ui/shared/navigation/nativeTabTriggers';
import { render } from '@testing-library/react-native';
import * as React from 'react';

type RecordedTrigger = {
  name?: string;
  label?: string;
  sf?: unknown;
  md?: unknown;
};

const recordedNativeTabsProps: Record<string, unknown>[] = [];
const recordedTriggers: RecordedTrigger[] = [];

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(() => ({ colorScheme: 'light' })),
}));

jest.mock('expo-router/unstable-native-tabs', () => {
  const React = require('react');

  function Trigger({ name, children }: { name?: string; children?: React.ReactNode }) {
    let label: string | undefined;
    let sf: unknown;
    let md: unknown;

    React.Children.forEach(children, (child: unknown) => {
      if (
        typeof child !== 'object' ||
        child === null ||
        !('type' in child) ||
        !('props' in child)
      ) {
        return;
      }

      const element = child as {
        type: unknown;
        props: { children?: string; sf?: unknown; md?: unknown };
      };

      if (element.type === Trigger.Label) {
        label = element.props.children;
      }

      if (element.type === Trigger.Icon) {
        sf = element.props.sf;
        md = element.props.md;
      }
    });

    recordedTriggers.push({ name, label, sf, md });
    return null;
  }

  Trigger.Label = function Label() {
    return null;
  };
  Trigger.Icon = function Icon() {
    return null;
  };
  Trigger.Badge = function Badge() {
    return null;
  };

  function NativeTabs(props: { children?: React.ReactNode }) {
    recordedNativeTabsProps.push(props);
    return props.children ?? null;
  }

  NativeTabs.Trigger = Trigger;

  return { NativeTabs };
});

import { NativeTabBar } from '@/src/ui/shared/navigation/NativeTabBar';
import { useColorScheme } from 'nativewind';

const useColorSchemeMock = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

function renderNativeTabBar(colorScheme: 'light' | 'dark') {
  recordedNativeTabsProps.length = 0;
  recordedTriggers.length = 0;
  useColorSchemeMock.mockReturnValue({
    colorScheme,
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
  });
  render(<NativeTabBar />);
}

describe('NativeTabBar', () => {
  it('minimizes on scroll down and uses light Flow colors', () => {
    renderNativeTabBar('light');

    expect(recordedNativeTabsProps).toHaveLength(1);
    expect(recordedNativeTabsProps[0]).toEqual(
      expect.objectContaining({
        minimizeBehavior: 'onScrollDown',
        disableTransparentOnScrollEdge: true,
        tintColor: THEME.light.brandInk,
        iconColor: {
          default: THEME.light.mutedForeground,
          selected: THEME.light.brandInk,
        },
        labelStyle: {
          default: { color: THEME.light.mutedForeground },
          selected: { color: THEME.light.brandInk },
        },
      })
    );
    expect(recordedTriggers).toEqual(
      nativeTabTriggers.map((trigger) => ({
        name: trigger.name,
        label: trigger.label,
        sf: trigger.sf,
        md: trigger.md,
      }))
    );
  });

  it('uses dark Flow colors when the scheme is dark', () => {
    renderNativeTabBar('dark');

    expect(recordedNativeTabsProps[0]).toEqual(
      expect.objectContaining({
        tintColor: THEME.dark.brandInk,
        iconColor: {
          default: THEME.dark.mutedForeground,
          selected: THEME.dark.brandInk,
        },
        labelStyle: {
          default: { color: THEME.dark.mutedForeground },
          selected: { color: THEME.dark.brandInk },
        },
      })
    );
  });
});
