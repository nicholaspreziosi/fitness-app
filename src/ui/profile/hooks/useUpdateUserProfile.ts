import { createUserProfileService } from '@/src/contexts/profile/application/createUserProfileService';
import type { UserProfileUpdate } from '@/src/contexts/profile/domain/userProfile.model';
import { userProfileQueryKeys } from '@/src/ui/profile/hooks/userProfileQueryKeys';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { dashboardQueryKeys } from '@/src/ui/dashboard/hooks/dashboardQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateUserProfile() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (update: UserProfileUpdate) => {
      const service = createUserProfileService(userId!);
      return service.updateProfile(userId!, update);
    },
    onSuccess: (updatedProfile) => {
      if (!userId) {
        return;
      }

      queryClient.setQueryData(userProfileQueryKeys(userId).all, updatedProfile);

      void queryClient.invalidateQueries({
        queryKey: workoutQueryKeys(userId).all,
      });
      void queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys(userId).all,
      });
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}
