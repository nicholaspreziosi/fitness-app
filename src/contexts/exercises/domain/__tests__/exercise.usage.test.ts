import { collectUsedExerciseIds } from '@/src/contexts/exercises/domain/exercise.usage';

describe('collectUsedExerciseIds', () => {
  it('returns exercise ids referenced in template blocks and workouts', () => {
    const usedIds = collectUsedExerciseIds({
      templateBlockExerciseIds: [['exercise-1', 'exercise-2'], ['exercise-3']],
      workoutExerciseIds: ['exercise-2', 'exercise-4'],
    });

    expect(usedIds).toEqual(
      new Set(['exercise-1', 'exercise-2', 'exercise-3', 'exercise-4'])
    );
  });

  it('returns an empty set when nothing references exercises', () => {
    expect(
      collectUsedExerciseIds({
        templateBlockExerciseIds: [],
        workoutExerciseIds: [],
      })
    ).toEqual(new Set());
  });
});
