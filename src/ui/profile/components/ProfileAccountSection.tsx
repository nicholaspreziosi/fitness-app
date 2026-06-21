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
import { ACCOUNT_STATUSES } from '@/src/contexts/profile/domain/userProfile.model';
import type { UserProfileFormValues } from '@/src/contexts/profile/domain/userProfileForm.schema';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { ConfirmDialog } from '@/src/ui/shared/components/ConfirmDialog';
import { View } from 'react-native';

type ProfileAccountSectionProps = {
  email?: string | null;
  values: UserProfileFormValues;
  onChange: (patch: Partial<UserProfileFormValues>) => void;
  onSignOut: () => void;
  signOutError?: string | null;
};

export function ProfileAccountSection({
  email,
  values,
  onChange,
  onSignOut,
  signOutError,
}: ProfileAccountSectionProps) {
  const accountStatusOption: Option = {
    value: values.accountStatus,
    label: values.accountStatus === 'active' ? 'Active' : 'Paused',
  };

  return (
    <ComponentDemoSection title="Account">
      <View className="rounded-lg border border-border bg-card px-3 py-3">
        <Text className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</Text>
        <Text className="mt-1 text-sm font-medium text-foreground">{email ?? 'Unknown user'}</Text>
      </View>

      <View className="gap-2">
        <Label nativeID="first-name">First name</Label>
        <Input
          nativeID="first-name"
          value={values.firstName ?? ''}
          onChangeText={(firstName) => onChange({ firstName })}
          placeholder="First name"
        />
      </View>

      <View className="gap-2">
        <Label nativeID="last-name">Last name</Label>
        <Input
          nativeID="last-name"
          value={values.lastName ?? ''}
          onChangeText={(lastName) => onChange({ lastName })}
          placeholder="Last name"
        />
      </View>

      <View className="gap-2">
        <Label nativeID="phone">Phone</Label>
        <Input
          nativeID="phone"
          value={values.phone ?? ''}
          onChangeText={(phone) => onChange({ phone })}
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
        />
      </View>

      <View className="gap-2">
        <Label>Account status</Label>
        <Select
          value={accountStatusOption}
          onValueChange={(option) => {
            if (option && (ACCOUNT_STATUSES as readonly string[]).includes(option.value)) {
              onChange({ accountStatus: option.value as UserProfileFormValues['accountStatus'] });
            }
          }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem label="Active" value="active" />
            <SelectItem label="Paused" value="paused" />
          </SelectContent>
        </Select>
      </View>

      {signOutError ? <Text className="text-sm text-destructive">{signOutError}</Text> : null}
      <ConfirmDialog
        triggerLabel="Sign out"
        title="Sign out of Flow?"
        description="You can sign back in anytime to access your workouts and library."
        confirmLabel="Sign out"
        onConfirm={onSignOut}
      />
    </ComponentDemoSection>
  );
}
