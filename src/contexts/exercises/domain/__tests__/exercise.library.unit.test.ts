import {
  BODY_PARTS,
  EQUIPMENT_OPTIONS,
  EXERCISE_PURPOSES,
  EXERCISE_STATUSES,
  EXERCISE_TYPES,
  MUSCLES,
  type BodyPart,
  type Equipment,
  type ExercisePurpose,
  type ExerciseStatus,
  type ExerciseType,
  type Muscle,
} from '@/src/contexts/exercises/domain/exercise.model';
import { exerciseSchema } from '@/src/contexts/exercises/domain/exercise.schema';
import { createMockExercise } from '@/test-utils/mockData';

describe('Exercise Library unit tests', () => {
  describe('Exercise schema', () => {
    it('validates a complete exercise', () => {
      expect(exerciseSchema.safeParse(createMockExercise()).success).toBe(true);
    });

    it('rejects missing required fields', () => {
      expect(exerciseSchema.safeParse({ name: 'Incomplete' }).success).toBe(false);
    });
  });

  describe('ExerciseStatus values', () => {
    it.each(['draft', 'active', 'archived'] as const)('accepts status %s', (status) => {
      expect(exerciseSchema.safeParse({ ...createMockExercise(), status }).success).toBe(true);
    });

    it('rejects invalid status values', () => {
      expect(
        exerciseSchema.safeParse({ ...createMockExercise(), status: 'deleted' }).success
      ).toBe(false);
    });
  });

  describe('favorite behavior', () => {
    it('accepts favorite true', () => {
      const result = exerciseSchema.safeParse({ ...createMockExercise(), favorite: true });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.favorite).toBe(true);
      }
    });

    it('accepts favorite false', () => {
      const result = exerciseSchema.safeParse({ ...createMockExercise(), favorite: false });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.favorite).toBe(false);
      }
    });

    it('allows favorite to be omitted', () => {
      const exercise = createMockExercise();
      delete exercise.favorite;

      const result = exerciseSchema.safeParse(exercise);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.favorite).toBeUndefined();
      }
    });
  });

  describe('classification constants', () => {
    it('BODY_PARTS matches BodyPart type', () => {
      const bodyPart: BodyPart = BODY_PARTS[0];
      expect(BODY_PARTS).toContain(bodyPart);
    });

    it('MUSCLES matches Muscle type', () => {
      const muscle: Muscle = MUSCLES[0];
      expect(MUSCLES).toContain(muscle);
    });

    it('EXERCISE_TYPES matches ExerciseType type', () => {
      const type: ExerciseType = EXERCISE_TYPES[0];
      expect(EXERCISE_TYPES).toContain(type);
    });

    it('EXERCISE_PURPOSES matches ExercisePurpose type', () => {
      const purpose: ExercisePurpose = EXERCISE_PURPOSES[0];
      expect(EXERCISE_PURPOSES).toContain(purpose);
    });

    it('EQUIPMENT_OPTIONS matches Equipment type', () => {
      const equipment: Equipment = EQUIPMENT_OPTIONS[0];
      expect(EQUIPMENT_OPTIONS).toContain(equipment);
    });

    it('EXERCISE_STATUSES matches ExerciseStatus type', () => {
      const status: ExerciseStatus = EXERCISE_STATUSES[0];
      expect(EXERCISE_STATUSES).toContain(status);
    });
  });
});
