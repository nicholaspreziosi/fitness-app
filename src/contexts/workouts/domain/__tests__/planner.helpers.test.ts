import {
  duplicateWorkout,
  generateWorkoutExerciseFromExercise,
  generateWorkoutExercisesFromTemplateBlock,
  generateWorkoutExercisesFromTemplateBlocks,
  getNextSortOrder,
  moveWorkoutExerciseToWorkout,
  removeWorkoutExercise,
  reorderWorkoutExercises,
  sortWorkoutExercises,
} from '@/src/contexts/workouts/domain/planner.helpers';
import {
  createMockExercise,
  createMockTemplateBlock,
  createMockWorkout,
  createMockWorkoutExercise,
} from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';

describe('planner.helpers', () => {
  describe('generation', () => {
    it('generates unique WorkoutExercise IDs', () => {
      const exercises = [
        createMockExercise({ id: 'exercise-1' }),
        createMockExercise({ id: 'exercise-2' }),
      ];
      const result = exercises.map((exercise, index) =>
        generateWorkoutExerciseFromExercise(exercise, index)
      );

      expect(result[0]?.id).not.toBe(result[1]?.id);
    });

    it('sets sourceTemplateBlockId to null for individually added exercises', () => {
      const result = generateWorkoutExerciseFromExercise(createMockExercise(), 0);

      expect(result?.sourceTemplateBlockId).toBeNull();
    });

    it('preserves block order and sourceTemplateBlockId when generating from template block', () => {
      const block = createMockTemplateBlock({
        id: 'block-1',
        exerciseIds: ['exercise-1', 'exercise-2'],
      });
      const exerciseMap = new Map([
        ['exercise-1', createMockExercise({ id: 'exercise-1' })],
        ['exercise-2', createMockExercise({ id: 'exercise-2', name: 'Leg Press' })],
      ]);

      const result = generateWorkoutExercisesFromTemplateBlock(block, exerciseMap, 0);

      expect(result).toHaveLength(2);
      expect(result[0]?.sourceTemplateBlockId).toBe('block-1');
      expect(result[0]?.exerciseId).toBe('exercise-1');
      expect(result[1]?.exerciseId).toBe('exercise-2');
    });

    it('appends multiple template blocks sequentially', () => {
      const blocks = [
        createMockTemplateBlock({ id: 'block-1', exerciseIds: ['exercise-1'] }),
        createMockTemplateBlock({ id: 'block-2', exerciseIds: ['exercise-2'] }),
      ];
      const exerciseMap = new Map([
        ['exercise-1', createMockExercise({ id: 'exercise-1' })],
        ['exercise-2', createMockExercise({ id: 'exercise-2' })],
      ]);

      const result = generateWorkoutExercisesFromTemplateBlocks(blocks, exerciseMap);

      expect(result.map((exercise) => exercise.sortOrder)).toEqual([0, 1]);
    });
  });

  describe('ordering', () => {
    it('sorts WorkoutExercises by sortOrder', () => {
      const exercises = [
        createMockWorkoutExercise({ id: 'b', sortOrder: 2 }),
        createMockWorkoutExercise({ id: 'a', sortOrder: 0 }),
        createMockWorkoutExercise({ id: 'c', sortOrder: 1 }),
      ];

      expect(sortWorkoutExercises(exercises).map((exercise) => exercise.id)).toEqual([
        'a',
        'c',
        'b',
      ]);
    });

    it('updates sortOrder after reorder', () => {
      const exercises = [
        createMockWorkoutExercise({ id: 'a', sortOrder: 0 }),
        createMockWorkoutExercise({ id: 'b', sortOrder: 1 }),
      ];

      const reordered = reorderWorkoutExercises(exercises, ['b', 'a']);

      expect(reordered.map((exercise) => exercise.sortOrder)).toEqual([0, 1]);
      expect(reordered[0]?.id).toBe('b');
    });
  });

  describe('movement', () => {
    it('moves WorkoutExercise to another workout', () => {
      const source = createMockWorkout({
        exercises: [
          createMockWorkoutExercise({ id: 'we-1', exerciseId: 'exercise-1', sortOrder: 0 }),
          createMockWorkoutExercise({ id: 'we-2', exerciseId: 'exercise-2', sortOrder: 1 }),
        ],
      });
      const target = createMockWorkout({
        id: 'workout-2',
        exercises: [createMockWorkoutExercise({ id: 'we-3', exerciseId: 'exercise-3', sortOrder: 0 })],
      });

      const { sourceWorkout, targetWorkout } = moveWorkoutExerciseToWorkout({
        source,
        target,
        workoutExerciseId: 'we-1',
      });

      expect(sourceWorkout.exercises).toHaveLength(1);
      expect(sourceWorkout.exercises[0]?.id).toBe('we-2');
      expect(targetWorkout.exercises).toHaveLength(2);
      expect(targetWorkout.exercises[1]?.exerciseId).toBe('exercise-1');
      expect(targetWorkout.exercises[1]?.sourceTemplateBlockId).toBeNull();
    });

    it('preserves planned and actual values when moving', () => {
      const source = createMockWorkout({
        exercises: [
          createMockWorkoutExercise({
            id: 'we-1',
            exerciseId: 'exercise-1',
            plannedSets: 3,
            actualSets: 3,
            completed: true,
            notes: 'Good set',
          }),
        ],
      });
      const target = createMockWorkout({ id: 'workout-2', exercises: [] });

      const { targetWorkout } = moveWorkoutExerciseToWorkout({
        source,
        target,
        workoutExerciseId: 'we-1',
      });

      expect(targetWorkout.exercises[0]).toMatchObject({
        plannedSets: 3,
        actualSets: 3,
        completed: true,
        notes: 'Good set',
      });
    });
  });

  describe('remove and duplicate', () => {
    it('removes exercise and reassigns sortOrder', () => {
      const exercises = [
        createMockWorkoutExercise({ id: 'we-1', sortOrder: 0 }),
        createMockWorkoutExercise({ id: 'we-2', sortOrder: 1 }),
      ];

      const result = removeWorkoutExercise(exercises, 'we-1');

      expect(result).toHaveLength(1);
      expect(result[0]?.sortOrder).toBe(0);
    });

    it('duplicates workout with new IDs and resets actual values', () => {
      const workout = createMockWorkout({
        exercises: [
          createMockWorkoutExercise({
            id: 'we-1',
            actualSets: 3,
            completed: true,
            sourceTemplateBlockId: 'block-1',
          }),
        ],
        activeSession: true,
        status: 'completed',
      });

      const duplicated = duplicateWorkout(workout, {
        newWorkoutId: 'workout-2',
        newExerciseIds: ['we-new-1'],
        targetDate: createTestDate(7),
      });

      expect(duplicated.id).toBe('workout-2');
      expect(duplicated.status).toBe('planned');
      expect(duplicated.activeSession).toBe(false);
      expect(duplicated.exercises[0]?.id).toBe('we-new-1');
      expect(duplicated.exercises[0]?.completed).toBe(false);
      expect(duplicated.exercises[0]?.actualSets).toBeUndefined();
    });
  });

  describe('getNextSortOrder', () => {
    it('returns 0 for empty list', () => {
      expect(getNextSortOrder([])).toBe(0);
    });

    it('returns next sequential sortOrder', () => {
      const exercises = [
        createMockWorkoutExercise({ sortOrder: 0 }),
        createMockWorkoutExercise({ sortOrder: 2 }),
      ];

      expect(getNextSortOrder(exercises)).toBe(3);
    });
  });
});
