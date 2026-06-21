type CollectUsedExerciseIdsInput = {
  templateBlockExerciseIds: readonly (readonly string[])[];
  workoutExerciseIds: readonly string[];
};

export function collectUsedExerciseIds({
  templateBlockExerciseIds,
  workoutExerciseIds,
}: CollectUsedExerciseIdsInput): ReadonlySet<string> {
  const usedIds = new Set<string>();

  for (const exerciseIds of templateBlockExerciseIds) {
    for (const exerciseId of exerciseIds) {
      usedIds.add(exerciseId);
    }
  }

  for (const exerciseId of workoutExerciseIds) {
    usedIds.add(exerciseId);
  }

  return usedIds;
}
