import { createDetailStackScreenOptions, createTabStackScreenOptions } from '@/src/ui/shared/navigation/stackScreenOptions';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function LibraryStackLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack screenOptions={createTabStackScreenOptions(colorScheme)}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="exercises/new"
        options={{
          ...createDetailStackScreenOptions(colorScheme),
          headerTitle: 'New Exercise',
          headerBackTitle: 'Library',
        }}
      />
      <Stack.Screen
        name="exercises/[id]"
        options={{
          ...createDetailStackScreenOptions(colorScheme),
          headerTitle: 'Edit Exercise',
          headerBackTitle: 'Library',
        }}
      />
      <Stack.Screen
        name="template-blocks/new"
        options={{
          ...createDetailStackScreenOptions(colorScheme),
          headerTitle: 'New Template',
          headerBackTitle: 'Library',
        }}
      />
      <Stack.Screen
        name="template-blocks/[id]"
        options={{
          ...createDetailStackScreenOptions(colorScheme),
          headerTitle: 'Edit Template',
          headerBackTitle: 'Library',
        }}
      />
    </Stack>
  );
}
