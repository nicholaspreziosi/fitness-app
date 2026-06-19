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
