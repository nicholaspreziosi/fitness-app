jest.mock('@/src/lib/firebase/app', () => ({
  getFirestoreDb: () => ({}),
}));

jest.unmock('@/src/ui/profile/hooks/useUserProfile');

import { buildDefaultProfileFields } from '@/src/contexts/profile/domain/userProfile.rules';
import { useUserProfile } from '@/src/ui/profile/hooks/useUserProfile';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

jest.mock('@/src/ui/shared/providers/AuthProvider');

const { createUserProfileService } = jest.requireMock(
  '@/src/contexts/profile/application/createUserProfileService'
);

describe('useUserProfile', () => {
  const profile = buildDefaultProfileFields('user-1', { country: 'US' });

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user-1', email: 'test@example.com' } });
    createUserProfileService.mockReturnValue({
      getOrCreateProfile: jest.fn().mockResolvedValue(profile),
    });
  });

  it('loads profile for authenticated user', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useUserProfile(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.profile?.id).toBe('user-1');
    });
  });
});
