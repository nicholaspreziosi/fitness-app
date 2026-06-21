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
import {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVELS,
  FITNESS_LEVEL_LABELS,
  FITNESS_LEVELS,
  GENDERS,
} from '@/src/contexts/profile/domain/userProfile.model';
import type { UserProfileFormValues } from '@/src/contexts/profile/domain/userProfileForm.schema';
import { getHeightLabel, getWeightLabel } from '@/src/lib/measurements/labels';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { View } from 'react-native';

type ProfileBodySectionProps = {
  values: UserProfileFormValues;
  onChange: (patch: Partial<UserProfileFormValues>) => void;
};

const GENDER_LABELS: Record<(typeof GENDERS)[number], string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  prefer_not_to_say: 'Prefer not to say',
};

export function ProfileBodySection({ values, onChange }: ProfileBodySectionProps) {
  const genderOption: Option | undefined = values.gender
    ? { value: values.gender, label: GENDER_LABELS[values.gender as keyof typeof GENDER_LABELS] }
    : undefined;
  const activityOption: Option | undefined = values.activityLevel
    ? {
        value: values.activityLevel,
        label: ACTIVITY_LEVEL_LABELS[values.activityLevel as keyof typeof ACTIVITY_LEVEL_LABELS],
      }
    : undefined;
  const fitnessOption: Option | undefined = values.fitnessLevel
    ? {
        value: values.fitnessLevel,
        label: FITNESS_LEVEL_LABELS[values.fitnessLevel as keyof typeof FITNESS_LEVEL_LABELS],
      }
    : undefined;

  return (
    <ComponentDemoSection title="Body">
      <View className="gap-2">
        <Label>Gender</Label>
        <Select
          value={genderOption}
          onValueChange={(option) => onChange({ gender: option?.value ?? '' })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDERS.map((gender) => (
              <SelectItem key={gender} label={GENDER_LABELS[gender]} value={gender} />
            ))}
          </SelectContent>
        </Select>
      </View>

      <View className="gap-2">
        <Label nativeID="height">{getHeightLabel(values.measurementSystem)}</Label>
        <Input
          nativeID="height"
          value={values.height ?? ''}
          onChangeText={(height) => onChange({ height })}
          placeholder={values.measurementSystem === 'metric' ? '180' : '70'}
          keyboardType="decimal-pad"
        />
      </View>

      <View className="gap-2">
        <Label nativeID="weight">{getWeightLabel(values.measurementSystem)}</Label>
        <Input
          nativeID="weight"
          value={values.weight ?? ''}
          onChangeText={(weight) => onChange({ weight })}
          placeholder={values.measurementSystem === 'metric' ? '82' : '180'}
          keyboardType="decimal-pad"
        />
      </View>

      <View className="gap-2">
        <Label>Activity level</Label>
        <Select
          value={activityOption}
          onValueChange={(option) => onChange({ activityLevel: option?.value ?? '' })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select activity level" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_LEVELS.map((level) => (
              <SelectItem key={level} label={ACTIVITY_LEVEL_LABELS[level]} value={level} />
            ))}
          </SelectContent>
        </Select>
      </View>

      <View className="gap-2">
        <Label>Fitness level</Label>
        <Select
          value={fitnessOption}
          onValueChange={(option) => onChange({ fitnessLevel: option?.value ?? '' })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select fitness level" />
          </SelectTrigger>
          <SelectContent>
            {FITNESS_LEVELS.map((level) => (
              <SelectItem key={level} label={FITNESS_LEVEL_LABELS[level]} value={level} />
            ))}
          </SelectContent>
        </Select>
      </View>
    </ComponentDemoSection>
  );
}
