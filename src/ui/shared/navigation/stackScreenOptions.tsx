import { THEME } from '@/lib/theme';
import type { NativeStackNavigationOptions } from 'expo-router/native-stack';
import { Platform } from 'react-native';

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
    // The web header hides the back label by default; show the screen's headerBackTitle
    // next to the arrow so pushed pages carry context like iOS does.
    ...(Platform.OS === 'web' ? { headerBackButtonDisplayMode: 'default' as const } : {}),
  };
}
