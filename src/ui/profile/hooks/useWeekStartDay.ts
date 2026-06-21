import type { WeekStartDay } from '@/src/contexts/profile/domain/userProfile.model';
import { useUserProfile } from '@/src/ui/profile/hooks/useUserProfile';

export function useWeekStartDay(): WeekStartDay {
  const { profile } = useUserProfile();
  return profile?.weekStartDay ?? 0;
}
