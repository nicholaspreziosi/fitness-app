import { Text } from '@/components/ui/text';
import {
  emptyUserProfileFormValues,
  userProfileFormSchema,
  type UserProfileFormValues,
} from '@/src/contexts/profile/domain/userProfileForm.schema';
import {
  formOutputToProfileUpdate,
  userProfileToFormValues,
} from '@/src/contexts/profile/domain/userProfileForm.mapper';
import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { ThemeToggle } from '@/src/ui/shared/components/ThemeToggle';
import { ProfileAccountSection } from '@/src/ui/profile/components/ProfileAccountSection';
import { ProfileBodySection } from '@/src/ui/profile/components/ProfileBodySection';
import { ProfileLocaleSection } from '@/src/ui/profile/components/ProfileLocaleSection';
import { ProfilePreferencesSection } from '@/src/ui/profile/components/ProfilePreferencesSection';
import { useUpdateUserProfile } from '@/src/ui/profile/hooks/useUpdateUserProfile';
import { useUserProfile } from '@/src/ui/profile/hooks/useUserProfile';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { checkFirebaseConnection, type FirebaseHealthResult } from '@/src/lib/firebase/health';
import { SaveIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function SettingsView() {
  const { user, signOut } = useAuth();
  const { profile, isLoading } = useUserProfile();
  const { updateProfile, isUpdating } = useUpdateUserProfile();
  const [formValues, setFormValues] = React.useState<UserProfileFormValues>(
    emptyUserProfileFormValues()
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
  const [signOutError, setSignOutError] = React.useState<string | null>(null);
  const [health, setHealth] = React.useState<FirebaseHealthResult | null>(null);

  React.useEffect(() => {
    if (!user?.id) {
      return;
    }

    setHealth(null);
    checkFirebaseConnection(user.id).then(setHealth);
  }, [user?.id]);

  React.useEffect(() => {
    if (profile) {
      setFormValues(userProfileToFormValues(profile));
    }
  }, [profile]);

  const handleChange = React.useCallback((patch: Partial<UserProfileFormValues>) => {
    setFormValues((current) => ({ ...current, ...patch }));
    setFormError(null);
    setSaveMessage(null);
  }, []);

  const handleSave = async () => {
    setFormError(null);
    setSaveMessage(null);

    const parsed = userProfileFormSchema.safeParse(formValues);

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Unable to save profile.');
      return;
    }

    try {
      await updateProfile(formOutputToProfileUpdate(parsed.data));
      setSaveMessage('Profile saved.');
    } catch {
      setFormError('Unable to save profile. Please try again.');
    }
  };

  const handleSignOut = async () => {
    setSignOutError(null);

    try {
      await signOut();
    } catch {
      setSignOutError('Unable to sign out. Please try again.');
    }
  };

  if (isLoading && !profile) {
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader title="Settings" description="Preferences and account management for Flow." />

      <ProfileAccountSection
        email={user?.email}
        values={formValues}
        onChange={handleChange}
        onSignOut={handleSignOut}
        signOutError={signOutError}
      />

      <ComponentDemoSection title="Appearance">
        <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
          <Text className="text-sm text-foreground">Theme</Text>
          <ThemeToggle />
        </View>
      </ComponentDemoSection>

      <ProfileLocaleSection values={formValues} onChange={handleChange} />
      <ProfileBodySection values={formValues} onChange={handleChange} />
      <ProfilePreferencesSection values={formValues} onChange={handleChange} />

      <ComponentDemoSection title="Actions">
        {formError ? <Text className="text-sm text-destructive">{formError}</Text> : null}
        {saveMessage ? <Text className="text-sm text-success">{saveMessage}</Text> : null}
        <FlowButton
          icon={SaveIcon}
          label={isUpdating ? 'Saving…' : 'Save changes'}
          onPress={() => void handleSave()}
          disabled={isUpdating}
        />
      </ComponentDemoSection>

      <ComponentDemoSection title="System">
        <View className="rounded-lg border border-border bg-muted/40 p-3">
          <Text className="text-sm font-medium text-foreground">Firebase Status</Text>
          {health === null ? (
            <View className="mt-3 flex-row items-center gap-2">
              <ActivityIndicator />
              <Text className="text-sm text-muted-foreground">Checking connection...</Text>
            </View>
          ) : (
            <FirebaseStatus health={health} />
          )}
        </View>
      </ComponentDemoSection>
    </ScreenContainer>
  );
}

function FirebaseStatus({ health }: { health: FirebaseHealthResult }) {
  if (health.status === 'missing_config') {
    return (
      <Text className="mt-2 text-sm text-warning">
        Missing configuration — add Firebase values to your .env file.
      </Text>
    );
  }

  if (health.status === 'error') {
    return <Text className="mt-2 text-sm text-destructive">Error: {health.message}</Text>;
  }

  return (
    <Text className="mt-2 text-sm text-success">
      Connected to project <Text variant="code">{health.projectId}</Text>
    </Text>
  );
}
