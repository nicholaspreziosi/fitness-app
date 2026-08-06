import type { Workout, WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';

export type ExerciseHistoryMetric = 'weight' | 'reps' | 'sets' | 'holdSeconds';

export type ExercisePerformancePoint = {
  workoutId: string;
  date: Date;
  weight?: number;
  reps?: number;
  sets?: number;
  holdSeconds?: number;
};

function maxDefined(values: Array<number | undefined>): number | undefined {
  const defined = values.filter((value): value is number => value !== undefined);
  if (defined.length === 0) {
    return undefined;
  }
  return Math.max(...defined);
}

function buildPointFromExercises(
  workoutId: string,
  date: Date,
  exercises: WorkoutExercise[]
): ExercisePerformancePoint | null {
  const weight = maxDefined(exercises.map((exercise) => exercise.actualWeight));
  const reps = maxDefined(exercises.map((exercise) => exercise.actualReps));
  const sets = maxDefined(exercises.map((exercise) => exercise.actualSets));
  const holdSeconds = maxDefined(exercises.map((exercise) => exercise.actualHoldSeconds));

  if (
    weight === undefined &&
    reps === undefined &&
    sets === undefined &&
    holdSeconds === undefined
  ) {
    return null;
  }

  return {
    workoutId,
    date,
    ...(weight !== undefined ? { weight } : {}),
    ...(reps !== undefined ? { reps } : {}),
    ...(sets !== undefined ? { sets } : {}),
    ...(holdSeconds !== undefined ? { holdSeconds } : {}),
  };
}

export function buildExercisePerformanceHistory(
  workouts: Workout[],
  exerciseId: string
): ExercisePerformancePoint[] {
  const points: ExercisePerformancePoint[] = [];

  for (const workout of workouts) {
    if (workout.status !== 'completed') {
      continue;
    }

    const matching = workout.exercises.filter((exercise) => exercise.exerciseId === exerciseId);
    if (matching.length === 0) {
      continue;
    }

    const point = buildPointFromExercises(workout.id, workout.date, matching);
    if (point) {
      points.push(point);
    }
  }

  return points.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getMetricValue(
  point: ExercisePerformancePoint,
  metric: ExerciseHistoryMetric
): number | undefined {
  return point[metric];
}
