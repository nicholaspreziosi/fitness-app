import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { addWeeks, getWeekDays, isSameDay, startOfDay } from '@/src/lib/dates/weekBounds';
import { DatePickerSheet } from '@/src/ui/shared/components/DatePickerSheet';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { DaySection } from '@/src/ui/workouts/components/DaySection';
import { DuplicateWorkoutSheet } from '@/src/ui/workouts/components/DuplicateWorkoutSheet';
import { ExercisePickerSheet } from '@/src/ui/workouts/components/ExercisePickerSheet';
import { TemplateBlockPickerSheet } from '@/src/ui/workouts/components/TemplateBlockPickerSheet';
import { WeekNavigator } from '@/src/ui/workouts/components/WeekNavigator';
import { WorkoutCreateSheet } from '@/src/ui/workouts/components/WorkoutCreateSheet';
import { usePlannerState } from '@/src/ui/workouts/hooks/usePlannerState';
import {
  ExpandedWorkoutSwipeBlockProvider,
  useExpandedWorkoutSwipeBlock,
} from '@/src/ui/workouts/hooks/useExpandedWorkoutSwipeBlock';
import { useWeekSwipeWithScrollGesture } from '@/src/ui/workouts/hooks/useWeekSwipeGesture';
import { useCanUseTrainingFeatures } from '@/src/ui/profile/hooks/useCanUseTrainingFeatures';
import { useWeeklyWorkouts } from '@/src/ui/workouts/hooks/useWeeklyWorkouts';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';
import { RefreshGuardProvider, useRefreshGuard } from '@/src/ui/shared/providers/RefreshGuardProvider';
import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';

export function CalendarView() {
  return (
    <ExpandedWorkoutSwipeBlockProvider>
      <RefreshGuardProvider>
        <CalendarViewContent />
      </RefreshGuardProvider>
    </ExpandedWorkoutSwipeBlockProvider>
  );
}

function CalendarViewContent() {
  const plannerState = usePlannerState();
  const { isDragging, isInputFocused } = useRefreshGuard();
  const { blockedRects } = useExpandedWorkoutSwipeBlock();
  const { workouts, weekStart, isLoading, isError, isRefreshing, refetch } = useWeeklyWorkouts(
    plannerState.weekAnchor
  );
  const canUseTraining = useCanUseTrainingFeatures();
  const mutations = useWorkoutMutations();
  const {
    exercises,
    isRefreshing: exercisesRefreshing,
    refetch: refetchExercises,
  } = useExerciseLibrary();

  const exercisesById = React.useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  const weekDays = React.useMemo(() => getWeekDays(weekStart), [weekStart]);

  const workoutsByDay = React.useMemo(() => {
    const map = new Map<string, typeof workouts>();

    for (const day of weekDays) {
      map.set(day.toISOString(), []);
    }

    for (const workout of workouts) {
      const key = weekDays.find((day) => isSameDay(day, workout.date))?.toISOString();
      if (key) {
        map.get(key)?.push(workout);
      }
    }

    return map;
  }, [weekDays, workouts]);

  const activeWorkout = React.useMemo(() => {
    const sheet = plannerState.activeSheet;

    if (sheet.type === 'addExercise' || sheet.type === 'addTemplate') {
      return workouts.find((workout) => workout.id === sheet.workoutId) ?? null;
    }

    return null;
  }, [plannerState.activeSheet, workouts]);

  const navigateToDate = React.useCallback(
    (date: Date) => {
      plannerState.setWeekAnchor(startOfDay(date));
    },
    [plannerState]
  );

  const goToPreviousWeek = React.useCallback(() => {
    plannerState.setWeekAnchor(addWeeks(plannerState.weekAnchor, -1));
  }, [plannerState]);

  const goToNextWeek = React.useCallback(() => {
    plannerState.setWeekAnchor(addWeeks(plannerState.weekAnchor, 1));
  }, [plannerState]);

  const scrollWeekSwipeGesture = useWeekSwipeWithScrollGesture({
    weekAnchor: plannerState.weekAnchor,
    onWeekChange: plannerState.setWeekAnchor,
    blockedRects,
  });

  const isEditingWorkout = plannerState.editingWorkoutId !== null;
  const isSheetOpen = plannerState.activeSheet.type !== 'none';
  const isSubmitting = mutations.isPending;
  const refreshEnabled =
    !isEditingWorkout &&
    !isSheetOpen &&
    !isDragging &&
    !isSubmitting &&
    !isInputFocused;
  const isPullRefreshing = isRefreshing || exercisesRefreshing;

  const handleRefresh = React.useCallback(async () => {
    await Promise.all([refetch(), refetchExercises()]);
  }, [refetch, refetchExercises]);

  const renderSheet = () => {
    switch (plannerState.activeSheet.type) {
      case 'addWorkout':
        return plannerState.activeSheet.date ? (
          <WorkoutCreateSheet
            date={plannerState.activeSheet.date}
            onClose={plannerState.closeSheet}
            onCreated={navigateToDate}
          />
        ) : (
          <DatePickerSheet
            title="Select Date"
            value={startOfDay(new Date())}
            confirmLabel="Continue"
            onClose={plannerState.closeSheet}
            onConfirm={(date) => plannerState.openSheet({ type: 'addWorkout', date })}
          />
        );
      case 'duplicateWorkout': {
        const sheet = plannerState.activeSheet;
        if (sheet.type !== 'duplicateWorkout') {
          return null;
        }

        return (
          <DuplicateWorkoutSheet
            workoutId={sheet.workoutId}
            initialDate={startOfDay(new Date())}
            onClose={plannerState.closeSheet}
            onDuplicated={navigateToDate}
          />
        );
      }
      case 'addExercise':
        return activeWorkout ? (
          <ExercisePickerSheet workout={activeWorkout} onClose={plannerState.closeSheet} />
        ) : null;
      case 'addTemplate':
        return activeWorkout ? (
          <TemplateBlockPickerSheet workout={activeWorkout} onClose={plannerState.closeSheet} />
        ) : null;
      case 'weekPicker':
        return (
          <DatePickerSheet
            title="Go to Date"
            value={plannerState.weekAnchor}
            confirmLabel="Go"
            onClose={plannerState.closeSheet}
            onConfirm={(date) => {
              navigateToDate(date);
              plannerState.closeSheet();
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ScreenContainer
        contentClassName="gap-6"
        scrollGesture={scrollWeekSwipeGesture}
        refreshing={isPullRefreshing}
        refreshEnabled={refreshEnabled}
        onRefresh={handleRefresh}>
        <PageHeader
          title="Calendar"
          description="Plan workouts for the week."
          rightAction={
            <Button
              size="sm"
              disabled={!canUseTraining}
              onPress={() => plannerState.openSheet({ type: 'addWorkout' })}>
              <Text>+ Add Workout</Text>
            </Button>
          }
        />

        <WeekNavigator
          weekAnchor={plannerState.weekAnchor}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onOpenWeekPicker={() => plannerState.openSheet({ type: 'weekPicker' })}
        />

        {isLoading ? (
          <LoadingState className="flex-none py-20" />
        ) : isError ? (
          <Text className="text-sm text-destructive">Unable to load workouts.</Text>
        ) : (
          <View className="gap-4">
            {weekDays.map((day) => (
              <DaySection
                key={day.toISOString()}
                date={day}
                workouts={workoutsByDay.get(day.toISOString()) ?? []}
                exercisesById={exercisesById}
                plannerState={plannerState}
                mutations={mutations}
                canUseTraining={canUseTraining}
              />
            ))}
          </View>
        )}
      </ScreenContainer>

      <Modal
        visible={plannerState.activeSheet.type !== 'none'}
        transparent
        animationType="none"
        onRequestClose={plannerState.closeSheet}>
        <View className="flex-1">
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={plannerState.closeSheet}
          />
          <View className="flex-1 justify-end" pointerEvents="box-none">
            <Pressable onPress={(event) => event.stopPropagation()}>{renderSheet()}</Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
