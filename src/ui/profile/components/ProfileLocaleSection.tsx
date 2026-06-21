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
import type { UserProfileFormValues } from '@/src/contexts/profile/domain/userProfileForm.schema';
import { WEEK_START_DAY_OPTIONS } from '@/src/lib/dates/weekBounds';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { View } from 'react-native';

type ProfileLocaleSectionProps = {
  values: UserProfileFormValues;
  onChange: (patch: Partial<UserProfileFormValues>) => void;
};

export function ProfileLocaleSection({ values, onChange }: ProfileLocaleSectionProps) {
  const weekStartOption: Option | undefined = values.weekStartDay
    ? {
        value: values.weekStartDay,
        label:
          WEEK_START_DAY_OPTIONS.find((option) => String(option.value) === values.weekStartDay)
            ?.label ?? values.weekStartDay,
      }
    : undefined;

  return (
    <ComponentDemoSection title="Locale & Schedule">
      <View className="gap-2">
        <Label nativeID="language">Language</Label>
        <Input
          nativeID="language"
          value={values.language ?? ''}
          onChangeText={(language) => onChange({ language })}
          placeholder="en-US"
        />
      </View>

      <View className="gap-2">
        <Label nativeID="country">Country</Label>
        <Input
          nativeID="country"
          value={values.country ?? ''}
          onChangeText={(country) => onChange({ country })}
          placeholder="US"
          autoCapitalize="characters"
        />
      </View>

      <View className="gap-2">
        <Label nativeID="timezone">Time zone</Label>
        <Input
          nativeID="timezone"
          value={values.timeZone ?? ''}
          onChangeText={(timeZone) => onChange({ timeZone })}
          placeholder="America/New_York"
        />
      </View>

      <View className="gap-2">
        <Label>Week starts on</Label>
        <Select
          value={weekStartOption}
          onValueChange={(option) => onChange({ weekStartDay: option?.value ?? '' })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {WEEK_START_DAY_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                label={option.label}
                value={String(option.value)}
              />
            ))}
          </SelectContent>
        </Select>
      </View>
    </ComponentDemoSection>
  );
}
