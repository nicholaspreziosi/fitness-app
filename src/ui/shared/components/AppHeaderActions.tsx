import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/src/ui/shared/components/ThemeToggle';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { LogOutIcon } from 'lucide-react-native';
import { View } from 'react-native';

export function AppHeaderActions() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Settings screen shows a detailed error if sign-out fails from there.
    }
  };

  return (
    <View className="flex-row items-center gap-1 py-2 pr-4">
      <ThemeToggle />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button accessibilityLabel="Logout" className="rounded-lg" size="sm" variant="ghost">
            <Icon as={LogOutIcon} className="size-5" />
            <Text className="text-sm font-medium">Logout</Text>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of Flow?</AlertDialogTitle>
            <AlertDialogDescription>
              You can sign back in anytime to access your workouts and library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleSignOut}>
              <Text>Sign out</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
