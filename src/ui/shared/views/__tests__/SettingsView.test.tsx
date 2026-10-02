jest.mock('@/src/ui/profile/components/ProfileAccountSection', () => ({
  ProfileAccountSection: ({ onSignOut }: { onSignOut: () => void }) => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>Account</Text>
        <Text>nick@example.com</Text>
        <Pressable accessibilityRole="button" onPress={onSignOut}>
          <Text>Sign out</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/src/ui/profile/components/ProfileLocaleSection', () => ({
  ProfileLocaleSection: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Locale & Schedule</Text>;
  },
}));

jest.mock('@/src/ui/profile/components/ProfileBodySection', () => ({
  ProfileBodySection: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Body</Text>;
  },
}));

jest.mock('@/src/ui/profile/components/ProfilePreferencesSection', () => ({
  ProfilePreferencesSection: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Preferences</Text>;
  },
}));

jest.mock('@/src/ui/shared/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/src/ui/profile/hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(),
}));

jest.mock('@/src/ui/profile/hooks/useUpdateUserProfile', () => ({
  useUpdateUserProfile: jest.fn(),
}));

jest.mock('@/src/lib/firebase/health', () => ({
  checkFirebaseConnection: jest.fn().mockResolvedValue({ status: 'connected', projectId: 'demo' }),
}));

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    ScreenContainer: ({
      children,
      onRefresh,
    }: {
      children: React.ReactNode;
      onRefresh?: () => void;
    }) => (
      <View>
        {onRefresh ? (
          <Pressable accessibilityRole="button" onPress={() => void onRefresh()}>
            <Text>Refresh</Text>
          </Pressable>
        ) : null}
        {children}
      </View>
    ),
  };
});

import { checkFirebaseConnection } from '@/src/lib/firebase/health';
import { buildDefaultProfileFields } from '@/src/contexts/profile/domain/userProfile.rules';
import { useUpdateUserProfile } from '@/src/ui/profile/hooks/useUpdateUserProfile';
import { useUserProfile } from '@/src/ui/profile/hooks/useUserProfile';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { SettingsView } from '@/src/ui/shared/views/SettingsView';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('SettingsView', () => {
  const profile = buildDefaultProfileFields('user-1', {
    country: 'US',
    language: 'en-US',
    timeZone: 'America/New_York',
  });

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1', email: 'nick@example.com' },
      signOut: jest.fn(),
    });
    (useUserProfile as jest.Mock).mockReturnValue({
      profile: { ...profile, firstName: 'Nick' },
      isLoading: false,
      refetch: jest.fn().mockResolvedValue(undefined),
    });
    (useUpdateUserProfile as jest.Mock).mockReturnValue({
      updateProfile: jest.fn().mockResolvedValue(undefined),
      isUpdating: false,
    });
  });

  it('renders profile sections and account email', () => {
    render(<SettingsView />);

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('nick@example.com')).toBeTruthy();
    expect(screen.getByText('Locale & Schedule')).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
    expect(screen.getByText('Preferences')).toBeTruthy();
  });

  it('saves profile changes', async () => {
    const updateProfile = jest.fn().mockResolvedValue(undefined);
    (useUpdateUserProfile as jest.Mock).mockReturnValue({
      updateProfile,
      isUpdating: false,
    });

    render(<SettingsView />);

    fireEvent.press(screen.getByText('Save changes'));

    await screen.findByText('Profile saved.');
    expect(updateProfile).toHaveBeenCalled();
  });

  it('signs out from the account section', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1', email: 'nick@example.com' },
      signOut,
    });

    render(<SettingsView />);

    fireEvent.press(screen.getByText('Sign out'));

    expect(signOut).toHaveBeenCalled();
  });

  it('refreshes the profile and connection check', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    (useUserProfile as jest.Mock).mockReturnValue({
      profile: { ...profile, firstName: 'Nick' },
      isLoading: false,
      refetch,
    });
    (checkFirebaseConnection as jest.Mock).mockClear();

    render(<SettingsView />);
    fireEvent.press(screen.getByText('Refresh'));

    expect(refetch).toHaveBeenCalled();
    await screen.findByText('Settings');
    expect(checkFirebaseConnection).toHaveBeenCalledWith('user-1');
  });
});
