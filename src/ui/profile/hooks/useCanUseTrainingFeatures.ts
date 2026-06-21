import { canUseTrainingFeatures } from '@/src/contexts/profile/domain/userProfile.rules';
import { useUserProfile } from '@/src/ui/profile/hooks/useUserProfile';

export function useCanUseTrainingFeatures(): boolean {
  const { profile } = useUserProfile();

  if (!profile) {
    return true;
  }

  return canUseTrainingFeatures(profile);
}
