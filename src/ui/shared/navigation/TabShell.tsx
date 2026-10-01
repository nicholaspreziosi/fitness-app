import { usePrefetchExerciseLibrary } from '@/src/ui/exercises/hooks/usePrefetchExerciseLibrary';
import { AccountPausedBanner } from '@/src/ui/profile/components/AccountPausedBanner';
import { usePrefetchUserProfile } from '@/src/ui/profile/hooks/usePrefetchUserProfile';
import { AppHeader } from '@/src/ui/shared/components/AppHeader';
import { AppHeaderScrollProvider } from '@/src/ui/shared/providers/AppHeaderScrollProvider';
import { View } from 'react-native';

export function TabShell({ children }: { children: React.ReactNode }) {
  usePrefetchExerciseLibrary();
  usePrefetchUserProfile();

  return (
    <AppHeaderScrollProvider>
      <View className="flex-1">
        <AccountPausedBanner />
        {children}
        <AppHeader />
      </View>
    </AppHeaderScrollProvider>
  );
}
