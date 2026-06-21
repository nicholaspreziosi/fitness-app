import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MEASUREMENT_SYSTEMS } from '@/src/contexts/profile/domain/userProfile.model';
import type { UserProfileFormValues } from '@/src/contexts/profile/domain/userProfileForm.schema';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { View } from 'react-native';

type ProfilePreferencesSectionProps = {
  values: UserProfileFormValues;
  showCompletedExercises: boolean;
  onChange: (patch: Partial<UserProfileFormValues>) => void;
  onShowCompletedChange: (value: boolean) => void;
};

export function ProfilePreferencesSection({
  values,
  showCompletedExercises,
  onChange,
  onShowCompletedChange,
}: ProfilePreferencesSectionProps) {
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

      <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
        <Label nativeID="show-completed-exercises">Show completed exercises</Label>
        <Switch
          accessibilityLabel="Show completed exercises"
          checked={showCompletedExercises}
          onCheckedChange={onShowCompletedChange}
          nativeID="show-completed-exercises"
        />
      </View>
    </ComponentDemoSection>
  );
}
