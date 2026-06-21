import {
  canAddExerciseToWorkout,
  canAddExercisesToWorkout,
  canAddTemplateBlockToWorkout,
  canAddTemplateBlocksToWorkout,
  canEditWorkoutExercises,
  canMoveExerciseBetweenWorkouts,
  canMoveWorkoutToDate,
  canReorderWorkoutExercises,
} from '@/src/contexts/workouts/domain/planner.rules';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';

describe('planner.rules', () => {
  const editableWorkout = createMockWorkout({
    exercises: [createMockWorkoutExercise({ exerciseId: 'exercise-1' })],
  });

  it('prevents duplicate exercise within workout', () => {
    const result = canAddExerciseToWorkout(editableWorkout, 'exercise-1');

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.message).toContain('already exists');
    }
  });

  it('prevents adding multiple exercises when one already exists in workout', () => {
    const result = canAddExercisesToWorkout(editableWorkout, ['exercise-2', 'exercise-1']);

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.message).toContain('already exist');
    }
  });

  it('allows adding multiple new exercises', () => {
    const result = canAddExercisesToWorkout(editableWorkout, ['exercise-2', 'exercise-3']);

    expect(result.allowed).toBe(true);
  });

  it('requires at least one exercise when adding in bulk', () => {
    const result = canAddExercisesToWorkout(editableWorkout, []);

    expect(result.allowed).toBe(false);
  });

  it('prevents adding template block when exercises already exist', () => {
    const result = canAddTemplateBlockToWorkout(editableWorkout, ['exercise-1', 'exercise-2']);

    expect(result.allowed).toBe(false);
  });

  it('allows adding multiple template blocks when exercises do not overlap', () => {
    const result = canAddTemplateBlocksToWorkout(editableWorkout, [
      { exerciseIds: ['exercise-2'] },
      { exerciseIds: ['exercise-3'] },
    ]);

    expect(result.allowed).toBe(true);
  });

  it('prevents adding template blocks with duplicate exercises across blocks', () => {
    const result = canAddTemplateBlocksToWorkout(editableWorkout, [
      { exerciseIds: ['exercise-2', 'exercise-3'] },
      { exerciseIds: ['exercise-3', 'exercise-4'] },
    ]);

    expect(result.allowed).toBe(false);
  });

  it('allows move into completed workout', () => {
    const source = createMockWorkout({ status: 'planned' });
    const target = createMockWorkout({ id: 'workout-2', status: 'completed', exercises: [] });

    const result = canMoveExerciseBetweenWorkouts(source, target, 'exercise-2');

    expect(result.allowed).toBe(true);
  });

  it('allows move out of skipped workout', () => {
    const source = createMockWorkout({ status: 'skipped' });
    const target = createMockWorkout({ id: 'workout-2', status: 'planned', exercises: [] });

    const result = canMoveExerciseBetweenWorkouts(source, target, 'exercise-1');

    expect(result.allowed).toBe(true);
  });

  it('allows move between editable workouts', () => {
    const source = createMockWorkout({ status: 'planned' });
    const target = createMockWorkout({ id: 'workout-2', status: 'draft', exercises: [] });

    const result = canMoveExerciseBetweenWorkouts(source, target, 'exercise-2');

    expect(result.allowed).toBe(true);
  });

  it('allows moving planned workout to another date', () => {
    const result = canMoveWorkoutToDate({ status: 'planned' });

    expect(result).toEqual({ allowed: true, requiresConfirmation: false });
  });

  it('allows moving completed and skipped workouts to another date', () => {
    expect(canMoveWorkoutToDate({ status: 'completed' })).toEqual({
      allowed: true,
      requiresConfirmation: false,
    });
    expect(canMoveWorkoutToDate({ status: 'skipped' })).toEqual({
      allowed: true,
      requiresConfirmation: false,
    });
  });

  it('requires confirmation for in-progress workout move', () => {
    const result = canMoveWorkoutToDate({ status: 'inProgress' });

    expect(result).toEqual({ allowed: true, requiresConfirmation: true });
  });

  it('prevents moving archived workout', () => {
    const result = canMoveWorkoutToDate({ status: 'archived' });

    expect(result.allowed).toBe(false);
  });

  it('allows edit and reorder for completed and skipped workouts', () => {
    expect(canEditWorkoutExercises('completed')).toEqual({ allowed: true });
    expect(canEditWorkoutExercises('skipped')).toEqual({ allowed: true });
    expect(canReorderWorkoutExercises({ status: 'planned' }).allowed).toBe(true);
    expect(canReorderWorkoutExercises({ status: 'completed' }).allowed).toBe(true);
    expect(canReorderWorkoutExercises({ status: 'skipped' }).allowed).toBe(true);
  });

  it('prevents edit and reorder for archived workouts', () => {
    expect(canEditWorkoutExercises('archived').allowed).toBe(false);
    expect(canReorderWorkoutExercises({ status: 'archived' }).allowed).toBe(false);
  });
});
