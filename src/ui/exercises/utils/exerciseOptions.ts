import {
  BODY_PARTS,
  EQUIPMENT_OPTIONS,
  EXERCISE_PURPOSES,
  EXERCISE_TYPES,
  MUSCLES,
} from '@/src/contexts/exercises/domain/exercise.model';
import type { ComboboxOption } from '@/src/ui/shared/components/ComboboxMultiSelect';

export function toComboboxOptions<T extends string>(values: readonly T[]): ComboboxOption[] {
  return values.map((value) => ({ label: value, value }));
}

export const bodyPartOptions = toComboboxOptions(BODY_PARTS);
export const muscleOptions = toComboboxOptions(MUSCLES);
export const exerciseTypeOptions = toComboboxOptions(EXERCISE_TYPES);
export const exercisePurposeOptions = toComboboxOptions(EXERCISE_PURPOSES);
export const equipmentOptions = toComboboxOptions(EQUIPMENT_OPTIONS);
