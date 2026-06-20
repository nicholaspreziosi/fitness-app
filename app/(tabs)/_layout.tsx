import { Icon } from '@/components/ui/icon';
import { THEME } from '@/lib/theme';
import { usePrefetchExerciseLibrary } from '@/src/ui/exercises/hooks/usePrefetchExerciseLibrary';
import { AppHeader } from '@/src/ui/shared/components/AppHeader';
import { AppHeaderScrollProvider } from '@/src/ui/shared/providers/AppHeaderScrollProvider';
import { Tabs } from 'expo-router';
import {
  CalendarIcon,
  CheckCircleIcon,
  DumbbellIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Platform, View } from 'react-native';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  usePrefetchExerciseLibrary();

  return (
    <AppHeaderScrollProvider>
      <View className="flex-1">
        <Tabs
          initialRouteName="home"
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.mutedForeground,
            tabBarStyle: {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              borderTopWidth: 1,
              ...Platform.select({
                ios: {
                  shadowColor: '#0F172A',
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
        <AppHeader />
      </View>
    </AppHeaderScrollProvider>
  );
}
