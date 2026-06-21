import { Text } from '@/components/ui/text';
import { isAccountPaused } from '@/src/contexts/profile/domain/userProfile.rules';
import { useUserProfile } from '@/src/ui/profile/hooks/useUserProfile';
import { View } from 'react-native';

export function AccountPausedBanner() {
  const { profile } = useUserProfile();

  if (!profile || !isAccountPaused(profile)) {
    return null;
  }

  return (
    <View
      testID="account-paused-banner"
      className="border-b border-warning/30 bg-warning/10 px-4 py-3">
      <Text className="text-sm font-medium text-warning">
        Your account is paused. Training actions are disabled until your account is active again.
      </Text>
    </View>
  );
}
