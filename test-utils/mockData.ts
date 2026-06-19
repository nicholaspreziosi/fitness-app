import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import type { WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';

import { createTestDate } from './testDates';

export function createMockExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'exercise-1',
    name: 'Pendulum Squat',
    createdAt: createTestDate(),
    updatedAt: createTestDate(),
    status: 'active',
    bodyPart: 'Upper Legs',
    primaryMuscles: ['Quads'],
    secondaryMuscles: ['Glute Max'],
    defaultSets: 2,
    defaultReps: 8,
    defaultWeight: 100,
    ...overrides,
  };
}

export function createMockTemplateBlock(
  overrides: Partial<TemplateBlock> = {}
): TemplateBlock {
  return {
    id: 'block-1',
    name: 'Quad Strength',
    createdAt: createTestDate(),
    updatedAt: createTestDate(),
    status: 'active',
    exerciseIds: ['exercise-1'],
    ...overrides,
  };
}

export function createMockWorkoutExercise(
  overrides: Partial<WorkoutExercise> = {}
): WorkoutExercise {
  return {
    id: 'workout-exercise-1',
    sortOrder: 0,
    exerciseId: 'exercise-1',
    completed: false,
    ...overrides,
  };
}

export function createMockWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'workout-1',
    name: 'Wednesday Lower Body',
    createdAt: createTestDate(),
    updatedAt: createTestDate(),
    status: 'planned',
    date: createTestDate(),
    exercises: [createMockWorkoutExercise()],
    ...overrides,
  };
}
