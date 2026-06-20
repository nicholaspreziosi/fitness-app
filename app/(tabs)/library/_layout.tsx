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
        name="exercises/[id]/index"
        options={{
          ...createDetailStackScreenOptions(colorScheme),
          headerTitle: 'Exercise',
          headerBackTitle: 'Library',
        }}
      />
      <Stack.Screen
        name="exercises/[id]/edit"
        options={{
          ...createDetailStackScreenOptions(colorScheme),
          headerTitle: 'Edit Exercise',
          headerBackTitle: 'Exercise',
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
        name="template-blocks/[id]/index"
        options={{
          ...createDetailStackScreenOptions(colorScheme),
          headerTitle: 'Template',
          headerBackTitle: 'Library',
        }}
      />
      <Stack.Screen
        name="template-blocks/[id]/edit"
        options={{
          ...createDetailStackScreenOptions(colorScheme),
          headerTitle: 'Edit Template',
          headerBackTitle: 'Template',
        }}
      />
    </Stack>
  );
}
