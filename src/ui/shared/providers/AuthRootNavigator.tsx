import {
  canAccessAppRoutes,
  canAccessAuthRoutes,
} from '@/src/contexts/auth/domain/authNavigation.rules';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';

export function AuthLoadingScreen() {
  return (
    <View testID="auth-loading-screen" className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" />
    </View>
  );
}

export function AuthRootNavigator() {
  const { user, loading } = useAuth();
  const { colorScheme } = useColorScheme();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={canAccessAppRoutes(user)}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={canAccessAuthRoutes(user)}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
