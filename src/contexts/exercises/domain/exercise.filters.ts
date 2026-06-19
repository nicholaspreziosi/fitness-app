import type {
  BodyPart,
  Equipment,
  Exercise,
  ExercisePurpose,
  ExerciseStatus,
  ExerciseType,
  Muscle,
} from './exercise.model';

export type ExerciseListFilters = {
  search?: string;
  status?: ExerciseStatus | 'all';
  favoritesOnly?: boolean;
  bodyParts?: BodyPart[];
  muscles?: Muscle[];
  types?: ExerciseType[];
  purposes?: ExercisePurpose[];
  equipment?: Equipment[];
};

export function countActiveExerciseFilters(filters: ExerciseListFilters): number {
  let count = 0;

  if (filters.status && filters.status !== 'all') {
    count += 1;
  }

  if (filters.favoritesOnly) {
    count += 1;
  }

  if (filters.bodyParts?.length) {
    count += 1;
  }

  if (filters.muscles?.length) {
    count += 1;
  }

  if (filters.types?.length) {
    count += 1;
  }

  if (filters.purposes?.length) {
    count += 1;
  }

  if (filters.equipment?.length) {
    count += 1;
  }

  return count;
}

function matchesMultiSelectFilter<T extends string>(
  selected: T[] | undefined,
  values: T[] | undefined,
  singleValue?: T
): boolean {
  if (!selected?.length) {
    return true;
  }

  const haystack = [...(values ?? []), ...(singleValue ? [singleValue] : [])];
  return selected.some((item) => haystack.includes(item));
}

export function filterExercises(
  exercises: Exercise[],
  filters: ExerciseListFilters
): Exercise[] {
  return exercises.filter((exercise) => {
    if (filters.status && filters.status !== 'all' && exercise.status !== filters.status) {
      return false;
    }

    if (filters.favoritesOnly && !exercise.favorite) {
      return false;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim().toLowerCase();
      if (!exercise.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    if (!matchesMultiSelectFilter(filters.bodyParts, undefined, exercise.bodyPart)) {
      return false;
    }

    if (
      !matchesMultiSelectFilter(filters.muscles, [
        ...(exercise.primaryMuscles ?? []),
        ...(exercise.secondaryMuscles ?? []),
      ])
    ) {
      return false;
    }

    if (!matchesMultiSelectFilter(filters.types, exercise.type)) {
      return false;
    }

    if (!matchesMultiSelectFilter(filters.purposes, exercise.purpose)) {
      return false;
    }

    if (!matchesMultiSelectFilter(filters.equipment, exercise.equipment)) {
      return false;
    }

    return true;
  });
}
