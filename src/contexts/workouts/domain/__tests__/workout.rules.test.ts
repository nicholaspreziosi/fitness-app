import {
  canHardDeleteExercise,
  isSelectableExercise,
  shouldArchiveExerciseInsteadOfDelete,
} from '@/src/contexts/exercises/domain/exercise.rules';
import {
  canHardDeleteTemplateBlock,
  isSelectableTemplateBlock,
} from '@/src/contexts/templateBlocks/domain/templateBlock.rules';
import {
  canHardDeleteWorkout,
  canRevertWorkoutToPlanned,
  canUsePlannedStatusForWorkout,
  isVisibleInWeeklyPlanner,
} from '@/src/contexts/workouts/domain/workout.rules';
import { createMockExercise, createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';

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
    it('can always be hard deleted because workouts store exercise copies', () => {
      expect(canHardDeleteTemplateBlock()).toBe(true);
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

    it('in-progress workouts can be hard deleted', () => {
      expect(canHardDeleteWorkout('inProgress')).toBe(true);
    });

    it('completed workouts can be hard deleted', () => {
      expect(canHardDeleteWorkout('completed')).toBe(true);
    });

    it('skipped workouts can be hard deleted', () => {
      expect(canHardDeleteWorkout('skipped')).toBe(true);
    });

    it('archived workouts cannot be hard deleted', () => {
      expect(canHardDeleteWorkout('archived')).toBe(false);
    });

    it('allows reverting in-progress, completed, and skipped workouts to planned on today or future dates', () => {
      const referenceDate = FIXED_DATE;
      const futureDate = createTestDate(1);

      expect(
        canRevertWorkoutToPlanned(
          createMockWorkout({ status: 'inProgress', date: futureDate }),
          referenceDate
        )
      ).toEqual({ allowed: true });
      expect(
        canRevertWorkoutToPlanned(
          createMockWorkout({ status: 'completed', date: futureDate }),
          referenceDate
        )
      ).toEqual({ allowed: true });
      expect(
        canRevertWorkoutToPlanned(
          createMockWorkout({ status: 'skipped', date: futureDate }),
          referenceDate
        )
      ).toEqual({ allowed: true });
    });

    it('rejects reverting past workouts to planned', () => {
      const referenceDate = FIXED_DATE;

      expect(
        canRevertWorkoutToPlanned(
          createMockWorkout({ status: 'completed', date: createTestDate(-1) }),
          referenceDate
        ).allowed
      ).toBe(false);
    });

    it('rejects reverting draft, planned, and archived workouts to planned', () => {
      const futureDate = createTestDate(1);

      expect(
        canRevertWorkoutToPlanned(
          createMockWorkout({ status: 'draft', date: futureDate }),
          FIXED_DATE
        ).allowed
      ).toBe(false);
      expect(
        canRevertWorkoutToPlanned(
          createMockWorkout({ status: 'planned', date: futureDate }),
          FIXED_DATE
        ).allowed
      ).toBe(false);
      expect(
        canRevertWorkoutToPlanned(
          createMockWorkout({ status: 'archived', date: futureDate }),
          FIXED_DATE
        ).allowed
      ).toBe(false);
    });

    it('rejects planned status for past workout dates', () => {
      expect(
        canUsePlannedStatusForWorkout(
          createMockWorkout({ status: 'planned', date: createTestDate(-1) }),
          FIXED_DATE
        ).allowed
      ).toBe(false);
      expect(
        canUsePlannedStatusForWorkout(
          createMockWorkout({ status: 'completed', date: createTestDate(-1) }),
          FIXED_DATE
        ).allowed
      ).toBe(true);
    });

    it('archived workouts should not appear in default weekly planner queries', () => {
      expect(isVisibleInWeeklyPlanner(createMockWorkout({ status: 'planned' }))).toBe(true);
      expect(isVisibleInWeeklyPlanner(createMockWorkout({ status: 'completed' }))).toBe(true);
      expect(isVisibleInWeeklyPlanner(createMockWorkout({ status: 'archived' }))).toBe(false);
    });
  });
});
