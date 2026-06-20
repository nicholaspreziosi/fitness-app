import type { WorkoutExercise } from './workout.model';

export function reorderWorkoutExercises(
  exercises: WorkoutExercise[],
  orderedIds: string[]
): WorkoutExercise[] {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  if (
    orderedIds.length !== exercises.length ||
    orderedIds.some((id) => !byId.has(id))
  ) {
    throw new Error('Exercise order must include each workout exercise exactly once.');
  }

  return orderedIds.map((id, sortOrder) => ({
    ...byId.get(id)!,
    sortOrder,
  }));
}

export function mergeVisibleExerciseReorder(
  exercises: WorkoutExercise[],
  visibleExerciseIds: string[],
  reorderedVisibleIds: string[]
): string[] {
  const visibleSet = new Set(visibleExerciseIds);

  if (
    reorderedVisibleIds.length !== visibleExerciseIds.length ||
    reorderedVisibleIds.some((id) => !visibleSet.has(id))
  ) {
    throw new Error('Reordered visible exercises must match the visible exercise set.');
  }

  const queue = [...reorderedVisibleIds];

  return exercises.map((exercise) => {
    if (visibleSet.has(exercise.id)) {
      const next = queue.shift();
      if (!next) {
        throw new Error('Reordered visible exercises must match the visible exercise set.');
      }
      return next;
    }

    return exercise.id;
  });
}
