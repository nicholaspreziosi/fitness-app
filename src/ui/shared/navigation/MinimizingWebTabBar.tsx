import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useTabBarMinimize } from '@/src/ui/shared/navigation/TabBarMinimizeProvider';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useColorScheme } from 'nativewind';
import { Pressable, View, type ViewStyle } from 'react-native';

const COLLAPSED_SIZE = 56;
export const WEB_TAB_BAR_EXPANDED_HEIGHT = 62;
export const WEB_TAB_BAR_BOTTOM_OFFSET = 16;

const pillMotion = {
  transitionProperty: 'width, height, opacity',
  transitionDuration: '280ms',
  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as ViewStyle;

function tabLabel(options: BottomTabBarProps['descriptors'][string]['options'], routeName: string) {
  if (typeof options.tabBarLabel === 'string') {
    return options.tabBarLabel;
  }

  return options.title ?? routeName;
}

export function MinimizingWebTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { minimized, expand } = useTabBarMinimize();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key]?.options;

  const onTabPress = (routeKey: string, routeName: string, focused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });

    if (!focused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View
      testID="web-tab-bar-overlay"
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: insets.bottom + WEB_TAB_BAR_BOTTOM_OFFSET,
        zIndex: 40,
        backgroundColor: 'transparent',
        pointerEvents: 'box-none',
      }}>
      <View
        testID={minimized ? 'web-tab-bar-collapsed' : 'web-tab-bar-expanded'}
        className="overflow-hidden rounded-lg border border-border bg-card"
        style={{
          alignSelf: 'flex-start',
          width: minimized ? COLLAPSED_SIZE : '100%',
          height: minimized ? COLLAPSED_SIZE : WEB_TAB_BAR_EXPANDED_HEIGHT,
          boxShadow:
            colorScheme === 'dark'
              ? '0 4px 12px rgba(0, 0, 0, 0.28)'
              : '0 4px 12px rgba(23, 23, 23, 0.1)',
          ...pillMotion,
        }}>
        <View
          accessibilityElementsHidden={minimized}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'stretch',
            opacity: minimized ? 0 : 1,
            paddingHorizontal: 4,
            paddingVertical: 4,
            pointerEvents: minimized ? 'none' : 'auto',
            ...pillMotion,
          }}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const color = focused ? theme.brandInk : theme.mutedForeground;
            const label = tabLabel(options, route.name);

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                className="flex-1 items-center justify-center gap-0.5 rounded-md"
                style={focused ? { backgroundColor: theme.muted } : undefined}
                onPress={() => onTabPress(route.key, route.name, focused)}>
                {options.tabBarIcon?.({ focused, color, size: 22 })}
                <Text className="text-[10px] font-semibold" style={{ color }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show tabs"
          accessible={minimized}
          accessibilityElementsHidden={!minimized}
          importantForAccessibility={minimized ? 'yes' : 'no-hide-descendants'}
          onPress={expand}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: COLLAPSED_SIZE,
            height: COLLAPSED_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: minimized ? 1 : 0,
            pointerEvents: minimized ? 'auto' : 'none',
            ...pillMotion,
          }}>
          {focusedOptions?.tabBarIcon?.({
            focused: true,
            color: theme.brandInk,
            size: 22,
          })}
        </Pressable>
      </View>
    </View>
  );
}
