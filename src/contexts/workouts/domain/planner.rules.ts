import type { Workout, WorkoutStatus } from './workout.model';

const EDITABLE_STATUSES: WorkoutStatus[] = ['draft', 'planned', 'inProgress'];

export type PlannerRuleResult =
  | { allowed: true }
  | { allowed: false; message: string };

export type MoveWorkoutRuleResult =
  | { allowed: true; requiresConfirmation: false }
  | { allowed: true; requiresConfirmation: true }
  | { allowed: false; message: string };

export function workoutContainsExerciseId(
  workout: Pick<Workout, 'exercises'>,
  exerciseId: string
): boolean {
  return workout.exercises.some((exercise) => exercise.exerciseId === exerciseId);
}

export function canAddExerciseToWorkout(
  workout: Pick<Workout, 'exercises' | 'status'>,
  exerciseId: string
): PlannerRuleResult {
  if (!canEditWorkoutExercises(workout.status).allowed) {
    return canEditWorkoutExercises(workout.status);
  }

  if (workoutContainsExerciseId(workout, exerciseId)) {
    return { allowed: false, message: 'This exercise already exists in the workout.' };
  }

  return { allowed: true };
}

export function canAddTemplateBlockToWorkout(
  workout: Pick<Workout, 'exercises' | 'status'>,
  blockExerciseIds: string[]
): PlannerRuleResult {
  if (!canEditWorkoutExercises(workout.status).allowed) {
    return canEditWorkoutExercises(workout.status);
  }

  const existing = blockExerciseIds.filter((id) => workoutContainsExerciseId(workout, id));

  if (existing.length > 0) {
    return {
      allowed: false,
      message: 'One or more exercises from this template block already exist in the workout.',
    };
  }

  return { allowed: true };
}

export function canEditWorkoutExercises(status: WorkoutStatus): PlannerRuleResult {
  if (status === 'completed') {
    return { allowed: false, message: 'Completed workouts cannot be edited.' };
  }

  if (status === 'skipped') {
    return { allowed: false, message: 'Skipped workouts cannot be edited.' };
  }

  if (status === 'archived') {
    return { allowed: false, message: 'Archived workouts cannot be edited.' };
  }

  return { allowed: true };
}

export function canReorderWorkoutExercises(
  workout: Pick<Workout, 'status'>
): PlannerRuleResult {
  return canEditWorkoutExercises(workout.status);
}

export function canMoveExerciseBetweenWorkouts(
  source: Pick<Workout, 'exercises' | 'status'>,
  target: Pick<Workout, 'exercises' | 'status'>,
  exerciseId: string
): PlannerRuleResult {
  const sourceEdit = canEditWorkoutExercises(source.status);
  if (!sourceEdit.allowed) {
    return sourceEdit;
  }

  const targetEdit = canEditWorkoutExercises(target.status);
  if (!targetEdit.allowed) {
    return targetEdit;
  }

  if (workoutContainsExerciseId(target, exerciseId)) {
    return {
      allowed: false,
      message: 'This exercise already exists in the target workout.',
    };
  }

  return { allowed: true };
}

export function canMoveWorkoutToDate(workout: Pick<Workout, 'status'>): MoveWorkoutRuleResult {
  if (workout.status === 'archived') {
    return { allowed: false, message: 'Archived workouts cannot be moved.' };
  }

  if (workout.status === 'completed') {
    return { allowed: false, message: 'Completed workouts cannot be moved.' };
  }

  if (workout.status === 'skipped') {
    return { allowed: false, message: 'Skipped workouts cannot be moved.' };
  }

  if (workout.status === 'inProgress') {
    return { allowed: true, requiresConfirmation: true };
  }

  return { allowed: true, requiresConfirmation: false };
}

export function isEditableWorkoutStatus(status: WorkoutStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}
