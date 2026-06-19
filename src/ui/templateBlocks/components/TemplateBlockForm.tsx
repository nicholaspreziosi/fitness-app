import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { TemplateBlockStatus } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import { TEMPLATE_BLOCK_STATUSES } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import { createEmptyTemplateBlockFormValues } from '@/src/contexts/templateBlocks/domain/templateBlockForm.mapper';
import {
  templateBlockFormSchema,
  type TemplateBlockFormOutput,
  type TemplateBlockFormValues,
} from '@/src/contexts/templateBlocks/domain/templateBlockForm.schema';
import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { cn } from '@/lib/utils';
import { MinusIcon, PlusIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type TemplateBlockFormMode = 'create' | 'edit';

type TemplateBlockFormProps = {
  mode?: TemplateBlockFormMode;
  exercises: Exercise[];
  initialValues?: Partial<TemplateBlockFormValues>;
  onSubmit: (values: TemplateBlockFormOutput) => void | Promise<void>;
};

export function TemplateBlockForm({
  mode = 'edit',
  exercises,
  initialValues,
  onSubmit,
}: TemplateBlockFormProps) {
  const isCreateMode = mode === 'create';
  const [values, setValues] = React.useState<TemplateBlockFormValues>(() =>
    createEmptyTemplateBlockFormValues(initialValues)
  );
  const [error, setError] = React.useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = React.useState<'draft' | 'save' | null>(null);

  const updateValues = (patch: Partial<TemplateBlockFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const selectedExerciseIds = new Set(values.exerciseIds);
  const selectedExercises = values.exerciseIds
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => exercise !== undefined);
  const availableExercises = exercises.filter((exercise) => !selectedExerciseIds.has(exercise.id));

  const addExercise = (exerciseId: string) => {
    if (selectedExerciseIds.has(exerciseId)) {
      return;
    }

    updateValues({ exerciseIds: [...values.exerciseIds, exerciseId] });
  };

  const removeExercise = (exerciseId: string) => {
    updateValues({ exerciseIds: values.exerciseIds.filter((id) => id !== exerciseId) });
  };

  const handleSubmit = async (status: TemplateBlockStatus) => {
    setError(null);

    const parsed = templateBlockFormSchema.safeParse(values);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Template block data is invalid.');
      return;
    }

    setSubmittingAction(status === 'draft' ? 'draft' : 'save');

    try {
      await onSubmit({
        ...parsed.data,
        status,
      });
    } catch {
      setError('Unable to save template block. Please try again.');
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
          testID="save-template-draft"
          variant="outline"
          onPress={() => handleSubmit('draft')}
        />
      ) : null}

      <View className="gap-4">
        <View className="gap-2">
          <Label nativeID="template-name">Name</Label>
          <Input
            nativeID="template-name"
            placeholder="Template name"
            value={values.name}
            onChangeText={(name) => updateValues({ name })}
          />
        </View>

        {!isCreateMode ? (
          <View className="gap-2">
            <Label>Status</Label>
            <View className="flex-row flex-wrap gap-2">
              {TEMPLATE_BLOCK_STATUSES.filter((option) => option !== 'archived').map((option) => {
                const selected = values.status === option;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    testID={`template-status-${option}`}
                    className={cn(
                      'rounded-full border px-3 py-1.5',
                      selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
                    )}
                    onPress={() => updateValues({ status: option })}>
                    <Text className={cn('text-sm', selected ? 'text-primary' : 'text-foreground')}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View className="gap-2">
          <Label>Exercises</Label>
          {selectedExercises.length === 0 ? (
            <Text className="text-sm text-muted-foreground">No exercises selected yet.</Text>
          ) : (
            <View className="gap-2">
              {selectedExercises.map((exercise) => (
                <View
                  key={exercise.id}
                  testID={`selected-exercise-${exercise.id}`}
                  className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                  <Text className="flex-1 text-foreground">{exercise.name}</Text>
                  <Pressable
                    accessibilityRole="button"
                    testID={`remove-exercise-${exercise.id}`}
                    className="rounded-md border border-border p-1.5"
                    onPress={() => removeExercise(exercise.id)}>
                    <MinusIcon className="text-foreground" size={16} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {availableExercises.length > 0 ? (
            <View className="gap-2">
              <Text className="text-sm text-muted-foreground">Add exercises</Text>
              {availableExercises.map((exercise) => (
                <View
                  key={exercise.id}
                  className="flex-row items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                  <Text className="flex-1 text-foreground">{exercise.name}</Text>
                  <Pressable
                    accessibilityRole="button"
                    testID={`add-exercise-${exercise.id}`}
                    className="rounded-md border border-border p-1.5"
                    onPress={() => addExercise(exercise.id)}>
                    <PlusIcon className="text-foreground" size={16} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View className="gap-2">
          <Label nativeID="template-notes">Notes</Label>
          <Textarea
            nativeID="template-notes"
            placeholder="Optional notes"
            value={values.notes ?? ''}
            onChangeText={(notes) => updateValues({ notes })}
          />
        </View>
      </View>

      <FlowButton
        disabled={submittingAction !== null}
        label={submittingAction === 'save' ? 'Saving...' : 'Save template'}
        testID="save-template-block"
        onPress={() => handleSubmit('active')}
      />
    </View>
  );
}
