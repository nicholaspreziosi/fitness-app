import type { DefaultUpdateField, PlannedVsActualReviewItem } from '@/src/contexts/workouts/domain/progression';
import {
  buildDefaultUpdatesFromReviewItems,
  detectPlannedVsActualIncreases,
} from '@/src/contexts/workouts/domain/progression';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { createExerciseService } from '@/src/contexts/exercises/application/createExerciseService';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import * as React from 'react';

export type ExerciseDefaultUpdateReview = {
  exerciseId: string;
  exerciseName: string;
  items: PlannedVsActualReviewItem[];
};

export type DefaultUpdateSelection = {
  exerciseId: string;
  fields: DefaultUpdateField[];
};

export function useProgressionPrompt() {
  const { user } = useAuth();
  const userId = user?.id;
  const { exercises } = useExerciseLibrary();
  const [reviews, setReviews] = React.useState<ExerciseDefaultUpdateReview[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  const openForWorkout = React.useCallback(
    (workout: Workout) => {
      const nextReviews = workout.exercises.flatMap((workoutExercise) => {
        if (!workoutExercise.completed) {
          return [];
        }

        const exercise = exercises.find((item) => item.id === workoutExercise.exerciseId);
        if (!exercise) {
          return [];
        }

        const items = detectPlannedVsActualIncreases(
          {
            plannedSets: workoutExercise.plannedSets,
            plannedReps: workoutExercise.plannedReps,
            plannedHoldSeconds: workoutExercise.plannedHoldSeconds,
            plannedWeight: workoutExercise.plannedWeight,
          },
          {
            actualSets: workoutExercise.actualSets,
            actualReps: workoutExercise.actualReps,
            actualHoldSeconds: workoutExercise.actualHoldSeconds,
            actualWeight: workoutExercise.actualWeight,
          }
        );

        if (items.length === 0) {
          return [];
        }

        return [
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            items,
          },
        ];
      });

      setReviews(nextReviews);
      setIsOpen(nextReviews.length > 0);
    },
    [exercises]
  );

  const close = React.useCallback(() => {
    setIsOpen(false);
    setReviews([]);
  }, []);

  const applySelectedUpdates = React.useCallback(
    async (selections: DefaultUpdateSelection[]) => {
      if (!userId) {
        return;
      }

      const service = createExerciseService(userId);

      for (const selection of selections) {
        const review = reviews.find((item) => item.exerciseId === selection.exerciseId);
        const exercise = exercises.find((item) => item.id === selection.exerciseId);

        if (!review || !exercise || selection.fields.length === 0) {
          continue;
        }

        const selectedItems = review.items.filter((item) => selection.fields.includes(item.field));
        const updates = buildDefaultUpdatesFromReviewItems(
          {
            defaultSets: exercise.defaultSets,
            defaultReps: exercise.defaultReps,
            defaultHoldSeconds: exercise.defaultHoldSeconds,
            defaultWeight: exercise.defaultWeight,
          },
          selectedItems
        );

        if (Object.keys(updates).length === 0) {
          continue;
        }

        await service.updateExercise({
          ...exercise,
          ...updates,
          updatedAt: new Date(),
        });
      }

      close();
    },
    [close, exercises, reviews, userId]
  );

  const skipAll = React.useCallback(() => {
    close();
  }, [close]);

  return {
    reviews,
    isOpen,
    openForWorkout,
    close,
    applySelectedUpdates,
    skipAll,
  };
}
