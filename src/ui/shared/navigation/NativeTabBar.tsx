import { THEME } from '@/lib/theme';
import { nativeTabTriggers } from '@/src/ui/shared/navigation/nativeTabTriggers';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'nativewind';

export function NativeTabBar() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <NativeTabs
      disableTransparentOnScrollEdge
      iconColor={{
        default: theme.mutedForeground,
        selected: theme.brandInk,
      }}
      labelStyle={{
        default: { color: theme.mutedForeground },
        selected: { color: theme.brandInk },
      }}
      minimizeBehavior="onScrollDown"
      tintColor={theme.brandInk}>
      {nativeTabTriggers.map((trigger) => (
        <NativeTabs.Trigger key={trigger.name} name={trigger.name}>
          <NativeTabs.Trigger.Icon md={trigger.md} sf={trigger.sf} />
          <NativeTabs.Trigger.Label>{trigger.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
