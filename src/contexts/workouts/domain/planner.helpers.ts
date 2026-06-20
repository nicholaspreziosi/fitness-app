import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import { createId } from '@/src/lib/id/createId';

import { reorderWorkoutExercises } from './workoutExerciseOrdering';
import type { Workout, WorkoutExercise } from './workout.model';

export type GenerateWorkoutExercisesOptions = {
  includeArchived?: boolean;
};

export function sortWorkoutExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return [...exercises].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function generateWorkoutExerciseFromExercise(
  exercise: Exercise,
  sortOrder: number,
  options: GenerateWorkoutExercisesOptions = {}
): WorkoutExercise | null {
  const { includeArchived = false } = options;

  if (!includeArchived && exercise.status === 'archived') {
    return null;
  }

  return {
    id: createId('workout-exercise'),
    sortOrder,
    exerciseId: exercise.id,
    sourceTemplateBlockId: null,
    bodyPart: exercise.bodyPart,
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    plannedSets: exercise.defaultSets,
    plannedReps: exercise.defaultReps,
    plannedHoldSeconds: exercise.defaultHoldSeconds,
    plannedWeight: exercise.defaultWeight,
    completed: false,
  };
}

export function generateWorkoutExercisesFromTemplateBlock(
  block: TemplateBlock,
  exerciseMap: Map<string, Exercise>,
  startSortOrder: number,
  options: GenerateWorkoutExercisesOptions = {}
): WorkoutExercise[] {
  const result: WorkoutExercise[] = [];
  let sortOrder = startSortOrder;

  for (const exerciseId of block.exerciseIds) {
    const exercise = exerciseMap.get(exerciseId);

    if (!exercise) {
      continue;
    }

    if (!options.includeArchived && exercise.status === 'archived') {
      continue;
    }

    result.push({
      id: createId('workout-exercise'),
      sortOrder,
      exerciseId: exercise.id,
      sourceTemplateBlockId: block.id,
      bodyPart: exercise.bodyPart,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      plannedSets: exercise.defaultSets,
      plannedReps: exercise.defaultReps,
      plannedHoldSeconds: exercise.defaultHoldSeconds,
      plannedWeight: exercise.defaultWeight,
      completed: false,
    });
    sortOrder += 1;
  }

  return result;
}

export function generateWorkoutExercisesFromTemplateBlocks(
  blocks: TemplateBlock[],
  exerciseMap: Map<string, Exercise>,
  startSortOrder = 0,
  options: GenerateWorkoutExercisesOptions = {}
): WorkoutExercise[] {
  let sortOrder = startSortOrder;
  const result: WorkoutExercise[] = [];

  for (const block of blocks) {
    const blockExercises = generateWorkoutExercisesFromTemplateBlock(
      block,
      exerciseMap,
      sortOrder,
      options
    );
    result.push(...blockExercises);
    sortOrder += blockExercises.length;
  }

  return result;
}

export function generateWorkoutExercisesFromExercises(
  exercises: Exercise[],
  startSortOrder = 0,
  options: GenerateWorkoutExercisesOptions = {}
): WorkoutExercise[] {
  const result: WorkoutExercise[] = [];
  let sortOrder = startSortOrder;

  for (const exercise of exercises) {
    const workoutExercise = generateWorkoutExerciseFromExercise(exercise, sortOrder, options);

    if (workoutExercise) {
      result.push(workoutExercise);
      sortOrder += 1;
    }
  }

  return result;
}

export function getNextSortOrder(exercises: WorkoutExercise[]): number {
  if (exercises.length === 0) {
    return 0;
  }

  return Math.max(...exercises.map((exercise) => exercise.sortOrder)) + 1;
}

export function removeWorkoutExercise(
  exercises: WorkoutExercise[],
  workoutExerciseId: string
): WorkoutExercise[] {
  const filtered = exercises.filter((exercise) => exercise.id !== workoutExerciseId);
  return reorderWorkoutExercises(
    filtered,
    sortWorkoutExercises(filtered).map((exercise) => exercise.id)
  );
}

export function moveWorkoutExerciseToWorkout(params: {
  source: Workout;
  target: Workout;
  workoutExerciseId: string;
}): { sourceWorkout: Workout; targetWorkout: Workout } {
  const { source, target, workoutExerciseId } = params;
  const exercise = source.exercises.find((item) => item.id === workoutExerciseId);

  if (!exercise) {
    throw new Error('Workout exercise not found in source workout.');
  }

  const nextSortOrder = getNextSortOrder(target.exercises);
  const movedExercise: WorkoutExercise = {
    ...exercise,
    sortOrder: nextSortOrder,
    sourceTemplateBlockId: null,
  };

  return {
    sourceWorkout: {
      ...source,
      exercises: removeWorkoutExercise(source.exercises, workoutExerciseId),
    },
    targetWorkout: {
      ...target,
      exercises: [...target.exercises, movedExercise],
    },
  };
}

export function duplicateWorkout(
  workout: Workout,
  params: { newWorkoutId: string; newExerciseIds: string[]; targetDate: Date }
): Workout {
  const sorted = sortWorkoutExercises(workout.exercises);

  if (sorted.length !== params.newExerciseIds.length) {
    throw new Error('New exercise IDs must match the number of workout exercises.');
  }

  const now = new Date();

  return {
    ...workout,
    id: params.newWorkoutId,
    date: params.targetDate,
    status: 'planned',
    activeSession: false,
    createdAt: now,
    updatedAt: now,
    exercises: sorted.map((exercise, index) => ({
      ...exercise,
      id: params.newExerciseIds[index]!,
      sortOrder: index,
      actualSets: undefined,
      actualReps: undefined,
      actualHoldSeconds: undefined,
      actualWeight: undefined,
      completed: false,
    })),
  };
}

export { reorderWorkoutExercises };
