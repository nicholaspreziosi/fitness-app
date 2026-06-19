import { createTabStackScreenOptions } from '@/src/ui/shared/navigation/stackScreenOptions';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function WorkoutStackLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack screenOptions={createTabStackScreenOptions(colorScheme)}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
