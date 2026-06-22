import { ForceLightTheme } from '@/src/ui/shared/components/ForceLightTheme';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <ForceLightTheme>
      <Stack screenOptions={{ headerShown: false }} />
    </ForceLightTheme>
  );
}
