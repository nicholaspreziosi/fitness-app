import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { checkFirebaseConnection, type FirebaseHealthResult } from '@/src/lib/firebase/health';
import { ConfirmDialog } from '@/src/ui/shared/components/ConfirmDialog';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { ThemeToggle } from '@/src/ui/shared/components/ThemeToggle';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { SaveIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function SettingsView() {
  const { user, signOut } = useAuth();
  const [health, setHealth] = React.useState<FirebaseHealthResult | null>(null);
  const [displayName, setDisplayName] = React.useState('Nick');
  const [units, setUnits] = React.useState<Option | undefined>({ value: 'lbs', label: 'Pounds (lbs)' });
  const [emailUpdates, setEmailUpdates] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [signOutError, setSignOutError] = React.useState<string | null>(null);

  React.useEffect(() => {
    checkFirebaseConnection().then(setHealth);
  }, []);

  const handleSignOut = async () => {
    setSignOutError(null);

    try {
      await signOut();
    } catch {
      setSignOutError('Unable to sign out. Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <PageHeader title="Settings" description="Preferences and account management for Flow." />

      <ComponentDemoSection title="Account">
        <View className="rounded-lg border border-border bg-card px-3 py-3">
          <Text className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</Text>
          <Text className="mt-1 text-sm font-medium text-foreground">
            {user?.email ?? 'Unknown user'}
          </Text>
        </View>
        {signOutError ? (
          <Text className="text-sm text-destructive">{signOutError}</Text>
        ) : null}
        <ConfirmDialog
          triggerLabel="Sign out"
          title="Sign out of Flow?"
          description="You can sign back in anytime to access your workouts and library."
          confirmLabel="Sign out"
          onConfirm={handleSignOut}
        />
      </ComponentDemoSection>

      <ComponentDemoSection title="Appearance">
        <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
          <Text className="text-sm text-foreground">Theme</Text>
          <ThemeToggle />
        </View>
      </ComponentDemoSection>

      <ComponentDemoSection title="Form Components">
        <View className="gap-2">
          <Label nativeID="display-name">Display name</Label>
          <Input
            nativeID="display-name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
          />
        </View>

        <View className="gap-2">
          <Label>Weight units</Label>
          <Select value={units} onValueChange={setUnits}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem label="Pounds (lbs)" value="lbs" />
              <SelectItem label="Kilograms (kg)" value="kg" />
            </SelectContent>
          </Select>
        </View>

        <View className="gap-2">
          <Label nativeID="profile-notes">Profile notes</Label>
          <Textarea
            nativeID="profile-notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes about your training goals..."
            numberOfLines={4}
          />
        </View>

        <PressableRow
          checked={emailUpdates}
          label="Send weekly summary emails"
          onToggle={() => setEmailUpdates((current) => !current)}
        />
      </ComponentDemoSection>

      <ComponentDemoSection title="Actions">
        <FlowButton icon={SaveIcon} label="Save changes" />
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

function PressableRow({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <Checkbox checked={checked} onCheckedChange={() => onToggle()} />
      <Label onPress={onToggle}>{label}</Label>
    </View>
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
