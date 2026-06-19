import { EXERCISE_STATUSES } from '@/src/contexts/exercises/domain/exercise.model';
import {
  canHardDeleteExercise,
  isSelectableExercise,
  shouldArchiveExerciseInsteadOfDelete,
} from '@/src/contexts/exercises/domain/exercise.rules';
import { createMockExercise } from '@/test-utils/mockData';

describe('exercise archive/delete rules', () => {
  it('archives instead of hard deleting exercises that have been used', () => {
    expect(shouldArchiveExerciseInsteadOfDelete(true)).toBe(true);
    expect(canHardDeleteExercise(true)).toBe(false);
  });

  it('allows hard delete only when the exercise has never been used', () => {
    expect(canHardDeleteExercise(false)).toBe(true);
    expect(shouldArchiveExerciseInsteadOfDelete(false)).toBe(false);
  });

  it('hides archived exercises from normal selection', () => {
    expect(isSelectableExercise(createMockExercise({ status: 'active' }))).toBe(true);
    expect(isSelectableExercise(createMockExercise({ status: 'draft' }))).toBe(true);
    expect(isSelectableExercise(createMockExercise({ status: 'archived' }))).toBe(false);
  });
});

describe('ExerciseStatus values', () => {
  it('includes draft, active, and archived', () => {
    expect(EXERCISE_STATUSES).toEqual(['draft', 'active', 'archived']);
  });
});
