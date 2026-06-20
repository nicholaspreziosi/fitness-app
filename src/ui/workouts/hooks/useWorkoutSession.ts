import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';

type UseWorkoutSessionOptions = {
  onNavigateToMode: (workoutId: string) => void;
  onNavigateToList: () => void;
};

export function useWorkoutSession({ onNavigateToMode, onNavigateToList }: UseWorkoutSessionOptions) {
  const { startWorkout, resumeWorkout, exitWorkout, completeWorkout, skipWorkout } =
    useWorkoutMutations();

  async function start(workoutId: string) {
    await startWorkout.mutateAsync(workoutId);
    onNavigateToMode(workoutId);
  }

  async function resume(workoutId: string) {
    await resumeWorkout.mutateAsync(workoutId);
    onNavigateToMode(workoutId);
  }

  async function exit(workoutId: string) {
    await exitWorkout.mutateAsync(workoutId);
    onNavigateToList();
  }

  async function finish(workoutId: string): Promise<Workout> {
    return completeWorkout.mutateAsync(workoutId);
  }

  async function skip(workoutId: string) {
    await skipWorkout.mutateAsync(workoutId);
    onNavigateToList();
  }

  return {
    start,
    resume,
    exit,
    finish,
    skip,
    isStarting: startWorkout.isPending,
    isResuming: resumeWorkout.isPending,
    isExiting: exitWorkout.isPending,
    isFinishing: completeWorkout.isPending,
    isSkipping: skipWorkout.isPending,
  };
}
