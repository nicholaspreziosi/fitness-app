import type { MeasurementSystem } from '@/src/contexts/profile/domain/userProfile.model';
import { useUserProfile } from '@/src/ui/profile/hooks/useUserProfile';

export function useMeasurementSystem(): MeasurementSystem {
  const { profile } = useUserProfile();
  return profile?.measurementSystem ?? 'imperial';
}
