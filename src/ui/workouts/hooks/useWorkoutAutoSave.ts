import { createWorkoutService } from '@/src/contexts/workouts/application/createWorkoutService';
import type { Workout, WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import {
  captureWorkoutListCaches,
  reorderWorkoutInCaches,
  restoreWorkoutListCaches,
  type WorkoutListCacheSnapshot,
} from '@/src/ui/workouts/hooks/workoutCacheHelpers';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

type WorkoutExercisePatch = Partial<
  Pick<
    WorkoutExercise,
    'completed' | 'actualSets' | 'actualReps' | 'actualHoldSeconds' | 'actualWeight' | 'notes'
  >
>;

type UseWorkoutAutoSaveOptions = {
  workout: Workout;
  weekQueryKey: readonly unknown[];
  debounceMs?: number;
};

type PendingChange = {
  workoutExerciseId: string;
  patch: WorkoutExercisePatch;
};

export function useWorkoutAutoSave({
  workout,
  weekQueryKey,
  debounceMs = 400,
}: UseWorkoutAutoSaveOptions) {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const pendingRef = React.useRef<PendingChange | null>(null);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotRef = React.useRef<Workout[] | undefined>(undefined);

  const restoreSnapshot = React.useCallback(() => {
    if (snapshotRef.current) {
      queryClient.setQueryData(weekQueryKey, snapshotRef.current);
      snapshotRef.current = undefined;
    }
  }, [queryClient, weekQueryKey]);

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const service = createWorkoutService(userId!);
      return service.reorderWorkoutExercises(workout.id, orderedIds);
    },
    onMutate: async (orderedIds) => {
      if (!userId) {
        return {};
      }

      await queryClient.cancelQueries({ queryKey: workoutQueryKeys(userId).all });

      const previousCaches = captureWorkoutListCaches(queryClient, userId);
      reorderWorkoutInCaches(queryClient, userId, workout.id, orderedIds);

      return { previousCaches } satisfies { previousCaches: WorkoutListCacheSnapshot };
    },
    onError: (error, _orderedIds, context) => {
      if (context?.previousCaches) {
        restoreWorkoutListCaches(queryClient, context.previousCaches);
      }
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Unable to save workout changes.');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setSaveError(null);
    },
  });

  const mutation = useMutation({
    mutationFn: async (change: PendingChange) => {
      const service = createWorkoutService(userId!);
      return service.updateWorkoutExercise(workout.id, change.workoutExerciseId, change.patch);
    },
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: weekQueryKey });

      queryClient.setQueryData<Workout[]>(weekQueryKey, (current) =>
        (current ?? []).map((item) =>
          item.id === workout.id
            ? {
                ...item,
                exercises: item.exercises.map((exercise) =>
                  exercise.id === change.workoutExerciseId
                    ? { ...exercise, ...change.patch }
                    : exercise
                ),
              }
            : item
        )
      );

      return undefined;
    },
    onError: (error) => {
      restoreSnapshot();
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Unable to save workout changes.');
    },
    onSuccess: () => {
      snapshotRef.current = undefined;
      setSaveStatus('saved');
      setSaveError(null);
    },
    onSettled: () => {
      pendingRef.current = null;
    },
  });

  const flushPending = React.useCallback(async () => {
    if (!pendingRef.current || !userId) {
      return;
    }

    const change = pendingRef.current;
    pendingRef.current = null;
    setSaveStatus('saving');

    try {
      await mutation.mutateAsync(change);
    } catch {
      // Error state handled in mutation.onError
    }
  }, [mutation, userId]);

  const scheduleSave = React.useCallback(
    (change: PendingChange) => {
      pendingRef.current = change;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void flushPending();
      }, debounceMs);
    },
    [debounceMs, flushPending]
  );

  const saveExerciseChange = React.useCallback(
    async (workoutExerciseId: string, patch: WorkoutExercisePatch) => {
      if (!userId) {
        return;
      }

      if (!snapshotRef.current) {
        snapshotRef.current = queryClient.getQueryData<Workout[]>(weekQueryKey);
      }

      const change = { workoutExerciseId, patch };

      queryClient.setQueryData<Workout[]>(weekQueryKey, (current) =>
        (current ?? []).map((item) =>
          item.id === workout.id
            ? {
                ...item,
                exercises: item.exercises.map((exercise) =>
                  exercise.id === workoutExerciseId ? { ...exercise, ...patch } : exercise
                ),
              }
            : item
        )
      );

      if (patch.completed !== undefined) {
        setSaveStatus('saving');
        try {
          await mutation.mutateAsync(change);
        } catch {
          // Error state handled in mutation.onError
        }
        return;
      }

      scheduleSave(change);
    },
    [mutation, queryClient, scheduleSave, userId, weekQueryKey, workout.id]
  );

  const saveExerciseReorder = React.useCallback(
    async (orderedIds: string[]) => {
      if (!userId) {
        return;
      }

      setSaveStatus('saving');

      try {
        await reorderMutation.mutateAsync(orderedIds);
      } catch {
        // Error state handled in reorderMutation.onError
      }
    },
    [reorderMutation, userId]
  );

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    saveExerciseChange,
    saveExerciseReorder,
    saveStatus,
    saveError,
  };
}
