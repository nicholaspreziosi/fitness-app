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
import { TEMPLATE_BLOCK_STATUSES } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import { WORKOUT_STATUSES } from '@/src/contexts/workouts/domain/workout.model';
import { createMockExercise } from '@/test-utils/mockData';

describe('exerciseSchema', () => {
  const baseExercise = createMockExercise();

  it('validates required fields', () => {
    const result = exerciseSchema.safeParse(baseExercise);

    expect(result.success).toBe(true);
  });

  it.each(['draft', 'active', 'archived'] as const)(
    'supports status: %s',
    (status) => {
      const result = exerciseSchema.safeParse({ ...baseExercise, status });

      expect(result.success).toBe(true);
    }
  );

  it('supports favorite', () => {
    const result = exerciseSchema.safeParse({ ...baseExercise, favorite: true });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.favorite).toBe(true);
    }
  });

  it('supports optional bodyPart', () => {
    const withBodyPart = exerciseSchema.safeParse(baseExercise);
    const withoutBodyPart = exerciseSchema.safeParse({
      ...baseExercise,
      bodyPart: undefined,
    });

    expect(withBodyPart.success).toBe(true);
    expect(withoutBodyPart.success).toBe(true);
  });

  it('supports primaryMuscles and secondaryMuscles', () => {
    const result = exerciseSchema.safeParse({
      ...baseExercise,
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glute Max', 'Hamstrings'],
    });

    expect(result.success).toBe(true);
  });

  it('supports otherPrimaryMuscles and otherSecondaryMuscles', () => {
    const result = exerciseSchema.safeParse({
      ...baseExercise,
      otherPrimaryMuscles: ['Custom primary'],
      otherSecondaryMuscles: ['Custom secondary'],
    });

    expect(result.success).toBe(true);
  });

  it('supports type, purpose, equipment, and otherEquipment', () => {
    const result = exerciseSchema.safeParse({
      ...baseExercise,
      type: ['Compound', 'Mobility'],
      purpose: ['Strength', 'Rehab'],
      equipment: ['Barbell', 'Bands'],
      otherEquipment: ['Sandbag'],
    });

    expect(result.success).toBe(true);
  });

  it('supports defaultSets, defaultReps, defaultHoldSeconds, and defaultWeight', () => {
    const result = exerciseSchema.safeParse({
      ...baseExercise,
      defaultSets: 3,
      defaultReps: 10,
      defaultHoldSeconds: 30,
      defaultWeight: 135,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid status values', () => {
    const result = exerciseSchema.safeParse({
      ...baseExercise,
      status: 'deleted',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid bodyPart values', () => {
    const result = exerciseSchema.safeParse({
      ...baseExercise,
      bodyPart: 'Invalid Body Part',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid muscle values', () => {
    const result = exerciseSchema.safeParse({
      ...baseExercise,
      primaryMuscles: ['Not A Muscle'],
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid equipment values', () => {
    const result = exerciseSchema.safeParse({
      ...baseExercise,
      equipment: ['Treadmill'],
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = exerciseSchema.safeParse({
      name: 'Incomplete',
    });

    expect(result.success).toBe(false);
  });
});

describe('domain constants', () => {
  it('BODY_PARTS matches BodyPart type', () => {
    const bodyPart: BodyPart = BODY_PARTS[0];
    expect(BODY_PARTS).toContain(bodyPart);
  });

  it('MUSCLES matches Muscle type', () => {
    const muscle: Muscle = MUSCLES[0];
    expect(MUSCLES).toContain(muscle);
  });

  it('EXERCISE_STATUSES matches ExerciseStatus type', () => {
    const status: ExerciseStatus = EXERCISE_STATUSES[0];
    expect(EXERCISE_STATUSES).toContain(status);
  });

  it('TEMPLATE_BLOCK_STATUSES matches TemplateBlockStatus type', () => {
    const status = TEMPLATE_BLOCK_STATUSES[0];
    expect(TEMPLATE_BLOCK_STATUSES).toContain(status);
  });

  it('WORKOUT_STATUSES matches WorkoutStatus type', () => {
    const status = WORKOUT_STATUSES[0];
    expect(WORKOUT_STATUSES).toContain(status);
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
});
