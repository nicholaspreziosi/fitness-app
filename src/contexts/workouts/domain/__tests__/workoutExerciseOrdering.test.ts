import {
  mergeVisibleExerciseReorder,
  reorderWorkoutExercises,
} from '@/src/contexts/workouts/domain/workoutExerciseOrdering';
import { createMockWorkoutExercise } from '@/test-utils/mockData';

describe('reorderWorkoutExercises', () => {
  it('updates sortOrder to match the new manual order', () => {
    const exercises = [
      createMockWorkoutExercise({ id: 'we-1', sortOrder: 0, exerciseId: 'exercise-1' }),
      createMockWorkoutExercise({ id: 'we-2', sortOrder: 1, exerciseId: 'exercise-2' }),
      createMockWorkoutExercise({ id: 'we-3', sortOrder: 2, exerciseId: 'exercise-3' }),
    ];

    const reordered = reorderWorkoutExercises(exercises, ['we-3', 'we-1', 'we-2']);

    expect(reordered.map((exercise) => exercise.id)).toEqual(['we-3', 'we-1', 'we-2']);
    expect(reordered.map((exercise) => exercise.sortOrder)).toEqual([0, 1, 2]);
  });

  it('throws when ordered ids do not match workout exercises', () => {
    const exercises = [
      createMockWorkoutExercise({ id: 'we-1' }),
      createMockWorkoutExercise({ id: 'we-2', sortOrder: 1 }),
    ];

    expect(() => reorderWorkoutExercises(exercises, ['we-2'])).toThrow(
      'Exercise order must include each workout exercise exactly once.'
    );
  });
});

describe('mergeVisibleExerciseReorder', () => {
  it('reorders only visible exercises while preserving hidden exercise positions', () => {
    const orderedIds = mergeVisibleExerciseReorder(
      [
        createMockWorkoutExercise({ id: 'we-1' }),
        createMockWorkoutExercise({ id: 'we-2' }),
        createMockWorkoutExercise({ id: 'we-3' }),
        createMockWorkoutExercise({ id: 'we-4' }),
      ],
      ['we-2', 'we-4'],
      ['we-4', 'we-2']
    );

    expect(orderedIds).toEqual(['we-1', 'we-4', 'we-3', 'we-2']);
  });
});
