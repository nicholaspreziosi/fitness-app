import { THEME } from '@/lib/theme';
import { AppHeaderActions } from '@/src/ui/shared/components/AppHeaderActions';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform, type ViewStyle } from 'react-native';

function createHeaderStyle(
  colorScheme: 'light' | 'dark' | null | undefined
): ViewStyle {
  const theme = THEME[colorScheme ?? 'light'];

  return {
    backgroundColor: theme.card,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    height: Platform.OS === 'ios' ? 96 : 72,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: colorScheme === 'dark' ? 0.2 : 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  };
}

export function createTabStackScreenOptions(
  colorScheme: 'light' | 'dark' | null | undefined
): NativeStackNavigationOptions {
  return {
    headerShown: false,
  };
}

export function createDetailStackScreenOptions(
  colorScheme: 'light' | 'dark' | null | undefined
): NativeStackNavigationOptions {
  const theme = THEME[colorScheme ?? 'light'];

  return {
    headerShown: true,
    headerStyle: createHeaderStyle(colorScheme) as NativeStackNavigationOptions['headerStyle'],
    headerShadowVisible: Platform.OS === 'ios',
    headerTintColor: theme.foreground,
    headerRight: () => <AppHeaderActions />,
  };
}
