import { THEME } from '@/lib/theme';
import type { NativeStackNavigationOptions } from 'expo-router/native-stack';

export function createTabStackScreenOptions(
  _colorScheme: 'light' | 'dark' | null | undefined
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
    headerTitle: '',
    headerStyle: {
      backgroundColor: 'transparent',
    },
    headerShadowVisible: false,
    headerTintColor: theme.foreground,
  };
}
