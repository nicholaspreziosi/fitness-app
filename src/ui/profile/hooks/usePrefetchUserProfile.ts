import { createUserProfileService } from '@/src/contexts/profile/application/createUserProfileService';
import {
  USER_PROFILE_STALE_TIME_MS,
  userProfileQueryKeys,
} from '@/src/ui/profile/hooks/userProfileQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

export function prefetchUserProfile(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string
) {
  return queryClient.prefetchQuery({
    queryKey: userProfileQueryKeys(userId).all,
    staleTime: USER_PROFILE_STALE_TIME_MS,
    retry: false,
    queryFn: async () => {
      const service = createUserProfileService(userId);
      return service.getOrCreateProfile(userId);
    },
  });
}

export function usePrefetchUserProfile() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (loading || !user?.id) {
      return;
    }

    void prefetchUserProfile(queryClient, user.id);
  }, [loading, queryClient, user?.id]);
}
