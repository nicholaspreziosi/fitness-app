import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import type { BodyPart, ExerciseStatus } from '@/src/contexts/exercises/domain/exercise.model';
import { EXERCISE_STATUSES } from '@/src/contexts/exercises/domain/exercise.model';
import { createEmptyExerciseFormValues } from '@/src/contexts/exercises/domain/exerciseForm.mapper';
import {
  exerciseFormSchema,
  type ExerciseFormOutput,
  type ExerciseFormValues,
} from '@/src/contexts/exercises/domain/exerciseForm.schema';
import { ComboboxMultiSelect } from '@/src/ui/shared/components/ComboboxMultiSelect';
import { ComboboxSelect } from '@/src/ui/shared/components/ComboboxSelect';
import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { SectionHeader } from '@/src/ui/shared/components/SectionHeader';
import { useMeasurementSystem } from '@/src/ui/profile/hooks/useMeasurementSystem';
import { getWeightLabel } from '@/src/lib/measurements/labels';
import {
  bodyPartOptions,
  equipmentOptions,
  exercisePurposeOptions,
  exerciseTypeOptions,
  muscleOptions,
} from '@/src/ui/exercises/utils/exerciseOptions';
import { cn } from '@/lib/utils';
import { SaveIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type ExerciseFormMode = 'create' | 'edit';

type ExerciseFormProps = {
  mode?: ExerciseFormMode;
  initialValues?: Partial<ExerciseFormValues>;
  onSubmit: (values: ExerciseFormOutput) => void | Promise<void>;
};

export function ExerciseForm({ mode = 'edit', initialValues, onSubmit }: ExerciseFormProps) {
  const measurementSystem = useMeasurementSystem();
  const isCreateMode = mode === 'create';
  const [values, setValues] = React.useState<ExerciseFormValues>(() =>
    createEmptyExerciseFormValues(initialValues)
  );
  const [error, setError] = React.useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = React.useState<'draft' | 'save' | null>(null);

  const updateValues = (patch: Partial<ExerciseFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const handleSubmit = async (status: ExerciseStatus) => {
    setError(null);

    const parsed = exerciseFormSchema.safeParse(values);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Exercise data is invalid.');
      return;
    }

    setSubmittingAction(status === 'draft' ? 'draft' : 'save');

    try {
      await onSubmit({
        ...parsed.data,
        status,
      });
    } catch {
      setError('Unable to save exercise. Please try again.');
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <View className="gap-6">
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}

      {isCreateMode ? (
        <FlowButton
          disabled={submittingAction !== null}
          label={submittingAction === 'draft' ? 'Saving...' : 'Save draft'}
          testID="save-exercise-draft"
          variant="outline"
          onPress={() => handleSubmit('draft')}
        />
      ) : null}

      <View className="gap-4">
        <View className="gap-2">
          <Label nativeID="exercise-name">Name</Label>
          <Input
            nativeID="exercise-name"
            placeholder="Exercise name"
            value={values.name}
            onChangeText={(name) => updateValues({ name })}
          />
        </View>

        {!isCreateMode ? (
          <View className="gap-2">
            <Label>Status</Label>
            <View className="flex-row flex-wrap gap-2">
              {EXERCISE_STATUSES.filter((option) => option !== 'archived').map((option) => {
                const selected = values.status === option;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    testID={`exercise-status-${option}`}
                    className={cn(
                      'rounded-full border px-3 py-1.5',
                      selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
                    )}
                    onPress={() => updateValues({ status: option as ExerciseStatus })}>
                    <Text className={cn('text-sm', selected ? 'text-primary' : 'text-foreground')}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <ComboboxSelect
          label="Body part"
          options={bodyPartOptions}
          placeholder="Select body part"
          testID="exercise-body-part"
          value={values.bodyPart}
          onChange={(bodyPart) => updateValues({ bodyPart: bodyPart as BodyPart | undefined })}
        />

        <ComboboxMultiSelect
          label="Primary muscles"
          options={muscleOptions}
          placeholder="Select primary muscles"
          value={values.primaryMuscles ?? []}
          onChange={(primaryMuscles) =>
            updateValues({
              primaryMuscles: primaryMuscles as ExerciseFormValues['primaryMuscles'],
            })
          }
        />

        <ComboboxMultiSelect
          label="Secondary muscles"
          options={muscleOptions}
          placeholder="Select secondary muscles"
          value={values.secondaryMuscles ?? []}
          onChange={(secondaryMuscles) =>
            updateValues({
              secondaryMuscles: secondaryMuscles as ExerciseFormValues['secondaryMuscles'],
            })
          }
        />

        <ComboboxMultiSelect
          label="Type"
          options={exerciseTypeOptions}
          placeholder="Select exercise types"
          value={values.type ?? []}
          onChange={(type) => updateValues({ type: type as ExerciseFormValues['type'] })}
        />

        <ComboboxMultiSelect
          label="Purpose"
          options={exercisePurposeOptions}
          placeholder="Select purposes"
          value={values.purpose ?? []}
          onChange={(purpose) => updateValues({ purpose: purpose as ExerciseFormValues['purpose'] })}
        />

        <ComboboxMultiSelect
          label="Equipment"
          options={equipmentOptions}
          placeholder="Select equipment"
          value={values.equipment ?? []}
          onChange={(equipment) =>
            updateValues({ equipment: equipment as ExerciseFormValues['equipment'] })
          }
        />
      </View>

      <View className="gap-4">
        <SectionHeader title="Defaults" description="Suggested prescription for new workouts." />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[45%] flex-1 gap-2">
            <Label nativeID="exercise-sets">Sets</Label>
            <Input
              nativeID="exercise-sets"
              keyboardType="number-pad"
              placeholder="Sets"
              value={values.defaultSets ?? ''}
              onChangeText={(defaultSets) => updateValues({ defaultSets })}
            />
          </View>
          <View className="min-w-[45%] flex-1 gap-2">
            <Label nativeID="exercise-reps">Reps</Label>
            <Input
              nativeID="exercise-reps"
              keyboardType="number-pad"
              placeholder="Reps"
              value={values.defaultReps ?? ''}
              onChangeText={(defaultReps) => updateValues({ defaultReps })}
            />
          </View>
          <View className="min-w-[45%] flex-1 gap-2">
            <Label nativeID="exercise-hold">Hold (seconds)</Label>
            <Input
              nativeID="exercise-hold"
              keyboardType="number-pad"
              placeholder="Hold seconds"
              value={values.defaultHoldSeconds ?? ''}
              onChangeText={(defaultHoldSeconds) => updateValues({ defaultHoldSeconds })}
            />
          </View>
          <View className="min-w-[45%] flex-1 gap-2">
            <Label nativeID="exercise-weight">Weight</Label>
            <Input
              nativeID="exercise-weight"
              keyboardType="decimal-pad"
              placeholder={getWeightLabel(measurementSystem)}
              value={values.defaultWeight ?? ''}
              onChangeText={(defaultWeight) => updateValues({ defaultWeight })}
            />
          </View>
        </View>
      </View>

      <View className="gap-2">
        <Label nativeID="exercise-notes">Notes</Label>
        <Textarea
          nativeID="exercise-notes"
          placeholder="Coaching cues, setup notes, or rehab context"
          value={values.notes ?? ''}
          onChangeText={(notes) => updateValues({ notes })}
        />
      </View>

      <FlowButton
        disabled={submittingAction !== null}
        icon={SaveIcon}
        label={submittingAction === 'save' ? 'Saving...' : 'Save exercise'}
        testID="save-exercise"
        onPress={() => handleSubmit(isCreateMode ? 'active' : values.status)}
      />
    </View>
  );
}
