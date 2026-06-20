import {
  canAddExerciseToWorkout,
  canAddTemplateBlockToWorkout,
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

  it('prevents adding template block when exercises already exist', () => {
    const result = canAddTemplateBlockToWorkout(editableWorkout, ['exercise-1', 'exercise-2']);

    expect(result.allowed).toBe(false);
  });

  it('prevents move into completed workout', () => {
    const source = createMockWorkout({ status: 'planned' });
    const target = createMockWorkout({ id: 'workout-2', status: 'completed', exercises: [] });

    const result = canMoveExerciseBetweenWorkouts(source, target, 'exercise-2');

    expect(result.allowed).toBe(false);
  });

  it('prevents move out of skipped workout', () => {
    const source = createMockWorkout({ status: 'skipped' });
    const target = createMockWorkout({ id: 'workout-2', status: 'planned', exercises: [] });

    const result = canMoveExerciseBetweenWorkouts(source, target, 'exercise-1');

    expect(result.allowed).toBe(false);
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

  it('requires confirmation for in-progress workout move', () => {
    const result = canMoveWorkoutToDate({ status: 'inProgress' });

    expect(result).toEqual({ allowed: true, requiresConfirmation: true });
  });

  it('prevents moving archived workout', () => {
    const result = canMoveWorkoutToDate({ status: 'archived' });

    expect(result.allowed).toBe(false);
  });

  it('allows reorder for editable workouts', () => {
    expect(canReorderWorkoutExercises({ status: 'planned' }).allowed).toBe(true);
    expect(canReorderWorkoutExercises({ status: 'completed' }).allowed).toBe(false);
  });
});
