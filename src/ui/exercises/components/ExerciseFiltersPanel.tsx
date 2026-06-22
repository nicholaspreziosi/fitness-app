import { Text } from '@/components/ui/text';
import { EXERCISE_STATUSES } from '@/src/contexts/exercises/domain/exercise.model';
import {
  countActiveExerciseFilters,
  type ExerciseListFilters,
} from '@/src/contexts/exercises/domain/exercise.filters';
import { Accordion } from '@/src/ui/shared/components/Accordion';
import { ComboboxMultiSelect } from '@/src/ui/shared/components/ComboboxMultiSelect';
import {
  bodyPartOptions,
  equipmentOptions,
  exercisePurposeOptions,
  exerciseTypeOptions,
  muscleOptions,
} from '@/src/ui/exercises/utils/exerciseOptions';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

const STATUS_OPTIONS: Array<{ label: string; value: ExerciseListFilters['status'] }> = [
  { label: 'All', value: 'all' },
  ...EXERCISE_STATUSES.map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: status,
  })),
];

type ExerciseFiltersPanelProps = {
  filters: ExerciseListFilters;
  onChange: (filters: ExerciseListFilters) => void;
};

export function ExerciseFiltersPanel({ filters, onChange }: ExerciseFiltersPanelProps) {
  const activeFilterCount = countActiveExerciseFilters(filters);
  const favoritesOnly = filters.favoritesOnly ?? false;

  return (
    <Accordion
      compact
      title="Filters"
      badge={activeFilterCount}
      defaultOpen={activeFilterCount > 0}
      testID="exercise-library-filters">
      <View className="flex-row flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((option) => {
          const selected = (filters.status ?? 'all') === option.value;

          return (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              testID={`status-filter-${option.value}`}
              className={cn(
                'rounded-full border px-2.5 py-1',
                selected ? 'border-brand bg-brand/10' : 'border-border bg-background'
              )}
              onPress={() => onChange({ ...filters, status: option.value })}>
              <Text className={cn('text-xs', selected ? 'text-brand' : 'text-muted-foreground')}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          testID="favorites-only-checkbox"
          className={cn(
            'rounded-full border px-2.5 py-1',
            favoritesOnly ? 'border-brand bg-brand/10' : 'border-border bg-background'
          )}
          onPress={() => onChange({ ...filters, favoritesOnly: !favoritesOnly })}>
          <Text
            className={cn('text-xs', favoritesOnly ? 'text-brand' : 'text-muted-foreground')}>
            Favorites
          </Text>
        </Pressable>
      </View>

      <View className="gap-2">
        <ComboboxMultiSelect
          options={bodyPartOptions}
          placeholder="Body part"
          value={filters.bodyParts ?? []}
          onChange={(bodyParts) =>
            onChange({ ...filters, bodyParts: bodyParts as ExerciseListFilters['bodyParts'] })
          }
        />

        <ComboboxMultiSelect
          options={muscleOptions}
          placeholder="Muscles"
          value={filters.muscles ?? []}
          onChange={(muscles) =>
            onChange({ ...filters, muscles: muscles as ExerciseListFilters['muscles'] })
          }
        />

        <View className="flex-row flex-wrap gap-2">
          <View className="min-w-[48%] flex-1">
            <ComboboxMultiSelect
              options={exerciseTypeOptions}
              placeholder="Type"
              value={filters.types ?? []}
              onChange={(types) =>
                onChange({ ...filters, types: types as ExerciseListFilters['types'] })
              }
            />
          </View>
          <View className="min-w-[48%] flex-1">
            <ComboboxMultiSelect
              options={exercisePurposeOptions}
              placeholder="Purpose"
              value={filters.purposes ?? []}
              onChange={(purposes) =>
                onChange({ ...filters, purposes: purposes as ExerciseListFilters['purposes'] })
              }
            />
          </View>
        </View>

        <ComboboxMultiSelect
          options={equipmentOptions}
          placeholder="Equipment"
          value={filters.equipment ?? []}
          onChange={(equipment) =>
            onChange({ ...filters, equipment: equipment as ExerciseListFilters['equipment'] })
          }
        />
      </View>
    </Accordion>
  );
}
