import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { MEASUREMENT_SYSTEMS } from '@/src/contexts/profile/domain/userProfile.model';
import type { UserProfileFormValues } from '@/src/contexts/profile/domain/userProfileForm.schema';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { View } from 'react-native';

type ProfilePreferencesSectionProps = {
  values: UserProfileFormValues;
  onChange: (patch: Partial<UserProfileFormValues>) => void;
};

export function ProfilePreferencesSection({ values, onChange }: ProfilePreferencesSectionProps) {
  const measurementOption: Option = {
    value: values.measurementSystem,
    label: values.measurementSystem === 'metric' ? 'Metric' : 'Imperial',
  };

  return (
    <ComponentDemoSection title="Preferences">
      <View className="gap-2">
        <Label>Measurement system</Label>
        <Select
          value={measurementOption}
          onValueChange={(option) => {
            if (option && (MEASUREMENT_SYSTEMS as readonly string[]).includes(option.value)) {
              onChange({
                measurementSystem: option.value as UserProfileFormValues['measurementSystem'],
              });
            }
          }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem label="Imperial (lbs, in)" value="imperial" />
            <SelectItem label="Metric (kg, cm)" value="metric" />
          </SelectContent>
        </Select>
      </View>
    </ComponentDemoSection>
  );
}
