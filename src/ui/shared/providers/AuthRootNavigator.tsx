import {
  canAccessAppRoutes,
  canAccessAuthRoutes,
} from '@/src/contexts/auth/domain/authNavigation.rules';
import { SplashView } from '@/src/ui/shared/components/SplashView';
import { useAppSplash } from '@/src/ui/shared/hooks/useAppSplash';
import { useAuthColorScheme } from '@/src/ui/shared/hooks/useAuthColorScheme';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export function AuthRootNavigator() {
  const { user, loading } = useAuth();
  const navigationColorScheme = useAuthColorScheme(user);
  const { onSplashReady, showSplash } = useAppSplash(!loading);

  if (showSplash) {
    return <SplashView onReady={onSplashReady} />;
  }

  return (
    <ThemeProvider value={NAV_THEME[navigationColorScheme]}>
      <StatusBar style={navigationColorScheme === 'dark' ? 'light' : 'dark'} />
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
