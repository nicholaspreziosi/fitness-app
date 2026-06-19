import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';

import type { WorkoutExercise } from './workout.model';

export type ProgressionMetric = 'weight' | 'reps' | 'sets' | 'holdSeconds';

export type ExerciseDefaults = Pick<
  Exercise,
  'defaultSets' | 'defaultReps' | 'defaultHoldSeconds' | 'defaultWeight'
>;

export type WorkoutActuals = Pick<
  WorkoutExercise,
  'actualSets' | 'actualReps' | 'actualHoldSeconds' | 'actualWeight'
>;

export type DefaultUpdateSuggestion = Partial<ExerciseDefaults>;

function isIncrease(defaultValue: number | undefined, actualValue: number | undefined): boolean {
  if (defaultValue === undefined || actualValue === undefined) {
    return false;
  }

  return actualValue > defaultValue;
}

export function detectIncreasedWeight(
  defaults: ExerciseDefaults,
  actuals: WorkoutActuals
): boolean {
  return isIncrease(defaults.defaultWeight, actuals.actualWeight);
}

export function detectIncreasedReps(defaults: ExerciseDefaults, actuals: WorkoutActuals): boolean {
  return isIncrease(defaults.defaultReps, actuals.actualReps);
}

export function detectIncreasedSets(defaults: ExerciseDefaults, actuals: WorkoutActuals): boolean {
  return isIncrease(defaults.defaultSets, actuals.actualSets);
}

export function detectIncreasedHoldDuration(
  defaults: ExerciseDefaults,
  actuals: WorkoutActuals
): boolean {
  return isIncrease(defaults.defaultHoldSeconds, actuals.actualHoldSeconds);
}

export function detectProgressionImprovements(
  defaults: ExerciseDefaults,
  actuals: WorkoutActuals
): ProgressionMetric[] {
  const improvements: ProgressionMetric[] = [];

  if (detectIncreasedWeight(defaults, actuals)) {
    improvements.push('weight');
  }

  if (detectIncreasedReps(defaults, actuals)) {
    improvements.push('reps');
  }

  if (detectIncreasedSets(defaults, actuals)) {
    improvements.push('sets');
  }

  if (detectIncreasedHoldDuration(defaults, actuals)) {
    improvements.push('holdSeconds');
  }

  return improvements;
}

export function hasProgressionImprovement(
  defaults: ExerciseDefaults,
  actuals: WorkoutActuals
): boolean {
  return detectProgressionImprovements(defaults, actuals).length > 0;
}

export function shouldAutoLowerDefaults(): boolean {
  return false;
}

export function getSuggestedDefaultUpdates(
  defaults: ExerciseDefaults,
  actuals: WorkoutActuals
): DefaultUpdateSuggestion | null {
  const updates: DefaultUpdateSuggestion = {};

  if (detectIncreasedWeight(defaults, actuals) && actuals.actualWeight !== undefined) {
    updates.defaultWeight = actuals.actualWeight;
  }

  if (detectIncreasedReps(defaults, actuals) && actuals.actualReps !== undefined) {
    updates.defaultReps = actuals.actualReps;
  }

  if (detectIncreasedSets(defaults, actuals) && actuals.actualSets !== undefined) {
    updates.defaultSets = actuals.actualSets;
  }

  if (detectIncreasedHoldDuration(defaults, actuals) && actuals.actualHoldSeconds !== undefined) {
    updates.defaultHoldSeconds = actuals.actualHoldSeconds;
  }

  return Object.keys(updates).length > 0 ? updates : null;
}

export function applyApprovedDefaultUpdates(
  defaults: ExerciseDefaults,
  actuals: WorkoutActuals
): ExerciseDefaults {
  const suggested = getSuggestedDefaultUpdates(defaults, actuals);

  if (!suggested) {
    return defaults;
  }

  return {
    ...defaults,
    ...suggested,
  };
}
