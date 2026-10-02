import { Icon } from '@/components/ui/icon';
import { THEME } from '@/lib/theme';
import { WEB_NAVBAR_MIN_WIDTH } from '@/src/ui/shared/hooks/useShowAppHeader';
import { MinimizingWebTabBar } from '@/src/ui/shared/navigation/MinimizingWebTabBar';
import { TabBarMinimizeProvider } from '@/src/ui/shared/navigation/TabBarMinimizeProvider';
import { tabsInitialRouteName } from '@/src/ui/shared/navigation/nativeTabTriggers';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import {
  CalendarIcon,
  CheckCircleIcon,
  DumbbellIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, useWindowDimensions } from 'react-native';

function renderMinimizingTabBar(props: BottomTabBarProps) {
  return <MinimizingWebTabBar {...props} />;
}

export function WebTabBar() {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const theme = THEME[colorScheme ?? 'light'];
  const compact = width < WEB_NAVBAR_MIN_WIDTH;

  return (
    <TabBarMinimizeProvider>
      <Tabs
        initialRouteName={tabsInitialRouteName}
        tabBar={compact ? renderMinimizingTabBar : undefined}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.brandInk,
          tabBarInactiveTintColor: theme.mutedForeground,
          ...(compact
            ? {}
            : {
                tabBarStyle: {
                  backgroundColor: theme.card,
                  borderTopColor: theme.border,
                  borderTopWidth: 1,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#171717',
                      shadowOffset: { width: 0, height: -1 },
                      shadowOpacity: colorScheme === 'dark' ? 0.2 : 0.06,
                      shadowRadius: 2,
                    },
                    android: {
                      elevation: 8,
                    },
                    default: {},
                  }),
                },
              }),
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Icon as={LayoutDashboardIcon} color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, size }) => <Icon as={CalendarIcon} color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color, size }) => (
              <Icon as={CheckCircleIcon} color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => <Icon as={DumbbellIcon} color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Icon as={SettingsIcon} color={color} size={size} />,
          }}
        />
      </Tabs>
    </TabBarMinimizeProvider>
  );
}
