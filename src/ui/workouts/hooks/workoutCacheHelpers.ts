import { moveWorkoutExerciseToWorkout } from '@/src/contexts/workouts/domain/planner.helpers';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { reorderWorkoutExercises } from '@/src/contexts/workouts/domain/workoutExerciseOrdering';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import type { QueryClient } from '@tanstack/react-query';

export type WorkoutListCacheSnapshot = ReadonlyMap<string, Workout[] | undefined>;

function serializeQueryKey(queryKey: readonly unknown[]): string {
  return JSON.stringify(queryKey);
}

export function captureWorkoutListCaches(
  queryClient: QueryClient,
  userId: string
): WorkoutListCacheSnapshot {
  const snapshot = new Map<string, Workout[] | undefined>();

  for (const [queryKey, data] of queryClient.getQueriesData<Workout[]>({
    queryKey: workoutQueryKeys(userId).all,
  })) {
    if (Array.isArray(data)) {
      snapshot.set(serializeQueryKey(queryKey), data);
    }
  }

  return snapshot;
}

export function restoreWorkoutListCaches(
  queryClient: QueryClient,
  snapshot: WorkoutListCacheSnapshot
): void {
  for (const [serializedKey, data] of snapshot) {
    queryClient.setQueryData(JSON.parse(serializedKey) as readonly unknown[], data);
  }
}

export function updateWorkoutListCaches(
  queryClient: QueryClient,
  userId: string,
  updateFn: (workouts: Workout[]) => Workout[]
): void {
  queryClient.setQueriesData<Workout[]>(
    { queryKey: workoutQueryKeys(userId).all },
    (current) => {
      if (!Array.isArray(current)) {
        return current;
      }

      const next = updateFn(current);
      return next === current ? current : next;
    }
  );
}

export function reorderWorkoutInCaches(
  queryClient: QueryClient,
  userId: string,
  workoutId: string,
  orderedIds: string[]
): void {
  updateWorkoutListCaches(queryClient, userId, (workouts) => {
    if (!workouts.some((workout) => workout.id === workoutId)) {
      return workouts;
    }

    return workouts.map((workout) =>
      workout.id === workoutId
        ? {
            ...workout,
            exercises: reorderWorkoutExercises(workout.exercises, orderedIds),
          }
        : workout
    );
  });
}

export function moveWorkoutExerciseInCaches(
  queryClient: QueryClient,
  userId: string,
  params: {
    sourceWorkoutId: string;
    workoutExerciseId: string;
    targetWorkoutId: string;
  }
): void {
  updateWorkoutListCaches(queryClient, userId, (workouts) => {
    const source = workouts.find((workout) => workout.id === params.sourceWorkoutId);
    const target = workouts.find((workout) => workout.id === params.targetWorkoutId);

    if (!source || !target) {
      return workouts;
    }

    const { sourceWorkout, targetWorkout } = moveWorkoutExerciseToWorkout({
      source,
      target,
      workoutExerciseId: params.workoutExerciseId,
    });

    return workouts.map((workout) => {
      if (workout.id === sourceWorkout.id) {
        return sourceWorkout;
      }

      if (workout.id === targetWorkout.id) {
        return targetWorkout;
      }

      return workout;
    });
  });
}
