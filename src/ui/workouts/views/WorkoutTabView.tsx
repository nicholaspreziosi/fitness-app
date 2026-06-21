import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { findActiveSessionWorkout } from '@/src/contexts/workouts/domain/workoutSession.rules';
import { getWeekBounds } from '@/src/lib/dates/weekBounds';
import { useWeekStartDay } from '@/src/ui/profile/hooks/useWeekStartDay';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { ProgressionPromptSheet } from '@/src/ui/workouts/components/ProgressionPromptSheet';
import { useProgressionPrompt } from '@/src/ui/workouts/hooks/useProgressionPrompt';
import { useTodayActiveWorkouts } from '@/src/ui/workouts/hooks/useTodayActiveWorkouts';
import { useWeeklyWorkouts } from '@/src/ui/workouts/hooks/useWeeklyWorkouts';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import { useWorkoutAutoSave } from '@/src/ui/workouts/hooks/useWorkoutAutoSave';
import { useWorkoutSession } from '@/src/ui/workouts/hooks/useWorkoutSession';
import { workoutQueryKeys } from '@/src/ui/workouts/hooks/workoutQueryKeys';
import { WorkoutListView } from '@/src/ui/workouts/views/WorkoutListView';
import { WorkoutModeView } from '@/src/ui/workouts/views/WorkoutModeView';
import { RefreshGuardProvider } from '@/src/ui/shared/providers/RefreshGuardProvider';
import { useAuth } from '@/src/ui/shared/providers/AuthProvider';
import * as React from 'react';

type WorkoutTabScreen = 'list' | 'mode';

type WorkoutTabViewProps = {
  today?: Date;
};

type WorkoutModeContainerProps = {
  workout: Workout;
  weekQueryKey: readonly unknown[];
  exerciseNames: Record<string, string>;
  onExit: () => void;
  onFinish: () => void;
  onSkip: () => void;
};

function WorkoutModeContainer({
  workout,
  weekQueryKey,
  exerciseNames,
  onExit,
  onFinish,
  onSkip,
}: WorkoutModeContainerProps) {
  const autoSave = useWorkoutAutoSave({ workout, weekQueryKey });
  const { removeExercise } = useWorkoutMutations();
  const { refetch, isRefreshing } = useWeeklyWorkouts(workout.date ?? new Date());

  const handleRemoveExercise = React.useCallback(
    (workoutExerciseId: string) => {
      removeExercise.mutate({ workoutId: workout.id, workoutExerciseId });
    },
    [removeExercise, workout.id]
  );

  const handleRefresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <RefreshGuardProvider>
      <WorkoutModeView
        workout={workout}
        exerciseNames={exerciseNames}
        saveStatus={autoSave.saveStatus}
        saveError={autoSave.saveError}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onExit={onExit}
        onFinish={onFinish}
        onSkip={onSkip}
        onExerciseChange={autoSave.saveExerciseChange}
        onReorderExercises={autoSave.saveExerciseReorder}
        onRemoveExercise={handleRemoveExercise}
      />
    </RefreshGuardProvider>
  );
}

export function WorkoutTabView({ today = new Date() }: WorkoutTabViewProps) {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const weekStartDay = useWeekStartDay();
  const { weekStart } = getWeekBounds(today, weekStartDay);
  const weekQueryKey = workoutQueryKeys(userId).week(weekStart.toISOString());
  const { workouts: todayWorkouts } = useTodayActiveWorkouts(today);
  const { workouts: weekWorkouts } = useWeeklyWorkouts(today);
  const { exercises } = useExerciseLibrary();
  const progressionPrompt = useProgressionPrompt();

  const [screen, setScreen] = React.useState<WorkoutTabScreen>('list');
  const [activeWorkoutId, setActiveWorkoutId] = React.useState<string | null>(null);
  const hasAutoOpenedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasAutoOpenedRef.current) {
      return;
    }

    const activeSessionWorkout = findActiveSessionWorkout(todayWorkouts);
    if (activeSessionWorkout) {
      hasAutoOpenedRef.current = true;
      setActiveWorkoutId(activeSessionWorkout.id);
      setScreen('mode');
    }
  }, [todayWorkouts]);

  const activeWorkout = React.useMemo(() => {
    if (!activeWorkoutId) {
      return null;
    }

    return weekWorkouts.find((workout) => workout.id === activeWorkoutId) ?? null;
  }, [activeWorkoutId, weekWorkouts]);

  const exerciseNames = React.useMemo(
    () =>
      Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise.name] as const)),
    [exercises]
  );

  const navigateToMode = React.useCallback((workoutId: string) => {
    setActiveWorkoutId(workoutId);
    setScreen('mode');
  }, []);

  const navigateToList = React.useCallback(() => {
    setActiveWorkoutId(null);
    setScreen('list');
  }, []);

  const session = useWorkoutSession({
    onNavigateToMode: navigateToMode,
    onNavigateToList: navigateToList,
  });

  const handleFinish = React.useCallback(async () => {
    if (!activeWorkoutId) {
      return;
    }

    const completed = await session.finish(activeWorkoutId);
    progressionPrompt.openForWorkout(completed);
    navigateToList();
  }, [activeWorkoutId, navigateToList, progressionPrompt, session]);

  const handleExit = React.useCallback(async () => {
    if (!activeWorkoutId) {
      navigateToList();
      return;
    }

    await session.exit(activeWorkoutId);
  }, [activeWorkoutId, navigateToList, session]);

  const handleSkip = React.useCallback(async () => {
    if (!activeWorkoutId) {
      navigateToList();
      return;
    }

    await session.skip(activeWorkoutId);
  }, [activeWorkoutId, navigateToList, session]);

  const progressionSheet = (
    <ProgressionPromptSheet
      reviews={progressionPrompt.reviews}
      isOpen={progressionPrompt.isOpen}
      onApply={progressionPrompt.applySelectedUpdates}
      onSkip={progressionPrompt.skipAll}
      onClose={progressionPrompt.close}
    />
  );

  if (screen === 'mode' && activeWorkout) {
    return (
      <>
        <WorkoutModeContainer
          workout={activeWorkout}
          weekQueryKey={weekQueryKey}
          exerciseNames={exerciseNames}
          onExit={handleExit}
          onFinish={handleFinish}
          onSkip={handleSkip}
        />
        {progressionSheet}
      </>
    );
  }

  return (
    <>
      <WorkoutListView
        today={today}
        onNavigateToMode={navigateToMode}
        onNavigateToList={navigateToList}
      />
      {progressionSheet}
    </>
  );
}
