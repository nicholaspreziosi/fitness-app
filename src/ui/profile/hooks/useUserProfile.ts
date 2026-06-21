import { createUserProfileService } from '@/src/contexts/profile/application/createUserProfileService';
import {
  USER_PROFILE_STALE_TIME_MS,
  userProfileQueryKeys,
} from '@/src/ui/profile/hooks/userProfileQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

export function useUserProfile() {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: userProfileQueryKeys(userId ?? '').all,
    enabled: Boolean(userId),
    staleTime: USER_PROFILE_STALE_TIME_MS,
    retry: false,
    queryFn: async () => {
      const service = createUserProfileService(userId!);
      return service.getOrCreateProfile(userId!);
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading && query.data === undefined,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
