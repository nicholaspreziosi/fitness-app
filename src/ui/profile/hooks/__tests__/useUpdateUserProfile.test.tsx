jest.mock('@/src/lib/firebase/app', () => ({
  getFirestoreDb: () => ({}),
}));

import { buildDefaultProfileFields } from '@/src/contexts/profile/domain/userProfile.rules';
import { useUpdateUserProfile } from '@/src/ui/profile/hooks/useUpdateUserProfile';
import { userProfileQueryKeys } from '@/src/ui/profile/hooks/userProfileQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

jest.mock('@/src/ui/shared/providers/AuthProvider');

const { createUserProfileService } = jest.requireMock(
  '@/src/contexts/profile/application/createUserProfileService'
);

describe('useUpdateUserProfile', () => {
  const profile = buildDefaultProfileFields('user-1', { country: 'US' });

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user-1', email: 'test@example.com' } });
    createUserProfileService.mockReturnValue({
      updateProfile: jest.fn().mockResolvedValue({ ...profile, firstName: 'Nick' }),
    });
  });

  it('updates profile and caches result', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(userProfileQueryKeys('user-1').all, profile);

    const { result } = renderHook(() => useUpdateUserProfile(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await act(async () => {
      await result.current.updateProfile({ firstName: 'Nick' });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(userProfileQueryKeys('user-1').all)).toMatchObject({
        firstName: 'Nick',
      });
    });
  });
});
