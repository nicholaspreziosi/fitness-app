import {
  canHardDeleteExercise,
  isSelectableExercise,
  shouldArchiveExerciseInsteadOfDelete,
} from '@/src/contexts/exercises/domain/exercise.rules';
import {
  canHardDeleteTemplateBlock,
  isSelectableTemplateBlock,
  shouldArchiveTemplateBlockInsteadOfDelete,
} from '@/src/contexts/templateBlocks/domain/templateBlock.rules';
import {
  canHardDeleteWorkout,
  isVisibleInWeeklyPlanner,
  shouldArchiveWorkoutInsteadOfDelete,
} from '@/src/contexts/workouts/domain/workout.rules';
import { createMockExercise, createMockWorkout } from '@/test-utils/mockData';

describe('archive and delete domain rules', () => {
  describe('exercises', () => {
    it('should be archived instead of hard deleted once used', () => {
      expect(shouldArchiveExerciseInsteadOfDelete(true)).toBe(true);
      expect(canHardDeleteExercise(true)).toBe(false);
    });

    it('can be hard deleted when never used', () => {
      expect(canHardDeleteExercise(false)).toBe(true);
      expect(shouldArchiveExerciseInsteadOfDelete(false)).toBe(false);
    });

    it('archived exercises should not appear in normal exercise selection', () => {
      expect(isSelectableExercise(createMockExercise({ status: 'active' }))).toBe(true);
      expect(isSelectableExercise(createMockExercise({ status: 'draft' }))).toBe(true);
      expect(isSelectableExercise(createMockExercise({ status: 'archived' }))).toBe(false);
    });
  });

  describe('template blocks', () => {
    it('should be archived instead of hard deleted once used', () => {
      expect(shouldArchiveTemplateBlockInsteadOfDelete(true)).toBe(true);
      expect(canHardDeleteTemplateBlock(true)).toBe(false);
    });

    it('can be hard deleted when never used', () => {
      expect(canHardDeleteTemplateBlock(false)).toBe(true);
    });

    it('archived template blocks should not appear in normal selection', () => {
      expect(isSelectableTemplateBlock('active')).toBe(true);
      expect(isSelectableTemplateBlock('archived')).toBe(false);
    });
  });

  describe('workouts', () => {
    it('draft workouts can be hard deleted', () => {
      expect(canHardDeleteWorkout('draft')).toBe(true);
    });

    it('planned workouts can be hard deleted', () => {
      expect(canHardDeleteWorkout('planned')).toBe(true);
    });

    it('completed workouts should be archived instead of hard deleted', () => {
      expect(shouldArchiveWorkoutInsteadOfDelete('completed')).toBe(true);
      expect(canHardDeleteWorkout('completed')).toBe(false);
    });

    it('skipped workouts should be archived instead of hard deleted', () => {
      expect(shouldArchiveWorkoutInsteadOfDelete('skipped')).toBe(true);
      expect(canHardDeleteWorkout('skipped')).toBe(false);
    });

    it('archived workouts should not appear in default weekly planner queries', () => {
      expect(isVisibleInWeeklyPlanner(createMockWorkout({ status: 'planned' }))).toBe(true);
      expect(isVisibleInWeeklyPlanner(createMockWorkout({ status: 'completed' }))).toBe(true);
      expect(isVisibleInWeeklyPlanner(createMockWorkout({ status: 'archived' }))).toBe(false);
    });
  });
});
