import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { sortWorkoutExercises } from '@/src/contexts/workouts/domain/planner.helpers';
import { canMoveWorkoutToDate } from '@/src/contexts/workouts/domain/planner.rules';
import { estimateWorkoutDuration } from '@/src/contexts/workouts/domain/workoutDuration';
import { isBeforeDay, isSameDay, startOfDay } from '@/src/lib/dates/weekBounds';
import { ConfirmDialog } from '@/src/ui/shared/components/ConfirmDialog';
import { PopoverMenu, type PopoverMenuItem } from '@/src/ui/shared/components/PopoverMenu';
import { PlannedExerciseRow } from '@/src/ui/workouts/components/PlannedExerciseRow';
import { WorkoutCard } from '@/src/ui/workouts/components/WorkoutCard';
import {
  WorkoutEditPanel,
  canEnterEditMode,
} from '@/src/ui/workouts/components/WorkoutEditPanel';
import type { PlannerState } from '@/src/ui/workouts/hooks/usePlannerState';
import type { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CopyIcon,
  RotateCcwIcon,
  SkipForwardIcon,
  Trash2Icon,
} from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  useRegisterExpandedWorkoutSwipeBlock,
} from '@/src/ui/workouts/hooks/useExpandedWorkoutSwipeBlock';

type PlannedWorkoutCardProps = {
  workout: Workout;
  exercisesById: Map<string, Exercise>;
  plannerState: PlannerState;
  mutations: ReturnType<typeof useWorkoutMutations>;
};

function buildDeleteMenuItem(onDelete: () => void): PopoverMenuItem {
  return {
    label: 'Delete',
    icon: Trash2Icon,
    destructive: true,
    testID: 'delete-workout',
    onPress: onDelete,
  };
}

function buildRevertMenuItem(
  workoutId: string,
  mutations: ReturnType<typeof useWorkoutMutations>
): PopoverMenuItem {
  return {
    label: 'Mark as planned',
    icon: RotateCcwIcon,
    testID: 'revert-workout',
    onPress: () => mutations.revertWorkoutToPlanned.mutate(workoutId),
  };
}

function buildMarkCompletedMenuItem(
  workoutId: string,
  mutations: ReturnType<typeof useWorkoutMutations>
): PopoverMenuItem {
  return {
    label: 'Mark as Completed',
    icon: CheckCircleIcon,
    testID: 'complete-workout',
    onPress: () => mutations.completeWorkout.mutate(workoutId),
  };
}

function buildMarkSkippedMenuItem(
  workoutId: string,
  mutations: ReturnType<typeof useWorkoutMutations>
): PopoverMenuItem {
  return {
    label: 'Mark as Skipped',
    icon: SkipForwardIcon,
    testID: 'skip-workout',
    onPress: () => mutations.skipWorkout.mutate(workoutId),
  };
}

function buildDuplicateMenuItem(
  workout: Workout,
  plannerState: PlannerState
): PopoverMenuItem {
  return {
    label: 'Duplicate',
    icon: CopyIcon,
    testID: 'duplicate-workout',
    onPress: () =>
      plannerState.openSheet({ type: 'duplicateWorkout', workoutId: workout.id }),
  };
}

function buildPastWorkoutMenuItems(
  workout: Workout,
  plannerState: PlannerState,
  mutations: ReturnType<typeof useWorkoutMutations>,
  onDelete: () => void
): PopoverMenuItem[] {
  const items: PopoverMenuItem[] = [];

  if (workout.status !== 'completed') {
    items.push(buildMarkCompletedMenuItem(workout.id, mutations));
  }

  if (workout.status !== 'skipped') {
    items.push(buildMarkSkippedMenuItem(workout.id, mutations));
  }

  items.push(buildDeleteMenuItem(onDelete), buildDuplicateMenuItem(workout, plannerState));

  return items;
}

function buildMenuItems(
  workout: Workout,
  plannerState: PlannerState,
  mutations: ReturnType<typeof useWorkoutMutations>,
  onDelete: () => void,
  referenceDate: Date = new Date()
): PopoverMenuItem[] {
  const isPast = isBeforeDay(workout.date, referenceDate);

  if (isPast && workout.status !== 'draft' && workout.status !== 'archived') {
    return buildPastWorkoutMenuItems(workout, plannerState, mutations, onDelete);
  }

  switch (workout.status) {
    case 'draft':
      return [buildDeleteMenuItem(onDelete)];
    case 'planned':
      return [buildDuplicateMenuItem(workout, plannerState), buildDeleteMenuItem(onDelete)];
    case 'inProgress':
      return [
        buildMarkSkippedMenuItem(workout.id, mutations),
        buildRevertMenuItem(workout.id, mutations),
        buildDeleteMenuItem(onDelete),
      ];
    case 'completed':
    case 'skipped':
      return [
        buildDuplicateMenuItem(workout, plannerState),
        buildRevertMenuItem(workout.id, mutations),
        buildDeleteMenuItem(onDelete),
      ];
    default:
      return [];
  }
}

export function PlannedWorkoutCard({
  workout,
  exercisesById,
  plannerState,
  mutations,
}: PlannedWorkoutCardProps) {
  const [pendingDate, setPendingDate] = React.useState<Date | null>(null);
  const [pendingPastStatusDate, setPendingPastStatusDate] = React.useState<Date | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState(false);
  const isEditing = plannerState.editingWorkoutId === workout.id;
  const isExpanded = plannerState.expandedWorkoutId === workout.id;
  const sortedExercises = React.useMemo(
    () => sortWorkoutExercises(workout.exercises),
    [workout.exercises]
  );
  const completedCount = workout.exercises.filter((exercise) => exercise.completed).length;

  const moveRule = React.useMemo(() => canMoveWorkoutToDate(workout), [workout]);

  const applyDateChange = React.useCallback(
    async (date: Date, pastStatus?: 'completed' | 'skipped') => {
      if (pastStatus) {
        await mutations.updateWorkout.mutateAsync({
          ...workout,
          date,
          status: pastStatus,
          activeSession: false,
        });
      } else {
        await mutations.moveWorkout.mutateAsync({
          workoutId: workout.id,
          date,
          confirmed: moveRule.allowed && moveRule.requiresConfirmation ? true : undefined,
        });
      }

      plannerState.setWeekAnchor(startOfDay(date));
      setPendingDate(null);
      setPendingPastStatusDate(null);
    },
    [mutations.moveWorkout, mutations.updateWorkout, moveRule, plannerState, workout]
  );

  const handleDateChange = React.useCallback(
    (date: Date) => {
      if (isSameDay(date, workout.date) || !moveRule.allowed) {
        return;
      }

      if (workout.status === 'planned' && isBeforeDay(date, new Date())) {
        setPendingPastStatusDate(date);
        return;
      }

      if (moveRule.requiresConfirmation) {
        setPendingDate(date);
        return;
      }

      void applyDateChange(date);
    },
    [applyDateChange, moveRule, workout.date, workout.status]
  );

  const canToggleEdit = canEnterEditMode(workout.status);
  const isCollapsible = workout.status !== 'archived';
  const cardRef = React.useRef<View>(null);
  const measureExpandedBounds = useRegisterExpandedWorkoutSwipeBlock(
    workout.id,
    isEditing,
    cardRef
  );

  const chevronRotation = useSharedValue(isExpanded ? 180 : 0);

  React.useEffect(() => {
    chevronRotation.value = withTiming(isExpanded ? 180 : 0, { duration: 200 });
  }, [chevronRotation, isExpanded]);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const handleToggleExpand = React.useCallback(() => {
    if (isEditing) {
      plannerState.exitEditMode();
      return;
    }

    if (isExpanded) {
      plannerState.toggleExpanded(workout.id);
      return;
    }

    if (canToggleEdit) {
      plannerState.enterEditMode(workout.id);
      return;
    }

    plannerState.toggleExpanded(workout.id);
  }, [canToggleEdit, isEditing, isExpanded, plannerState, workout.id]);

  const menuItems = buildMenuItems(workout, plannerState, mutations, () => setPendingDelete(true));

  const headerActions = isCollapsible ? (
    <>
      <Button
        accessibilityLabel={isExpanded ? 'Collapse workout' : 'Expand workout'}
        className="size-11"
        testID={isExpanded ? 'workout-collapse' : 'workout-expand'}
        variant="ghost"
        onPress={handleToggleExpand}>
        <Animated.View style={chevronAnimatedStyle}>
          <Icon as={ChevronDownIcon} className="size-6 text-muted-foreground" />
        </Animated.View>
      </Button>
      {menuItems.length > 0 ? (
        <>
          <View className="mx-0.5 h-5 w-px bg-border" />
          <PopoverMenu items={menuItems} menuAlign="end" size="lg" triggerTestID="workout-actions-menu" />
        </>
      ) : null}
    </>
  ) : menuItems.length > 0 ? (
    <PopoverMenu items={menuItems} menuAlign="end" size="lg" triggerTestID="workout-actions-menu" />
  ) : null;

  return (
    <>
      <View
        ref={cardRef}
        collapsable={false}
        onLayout={isEditing ? measureExpandedBounds : undefined}>
        <WorkoutCard
          name={workout.name}
          status={workout.status}
          exerciseCount={workout.exercises.length}
          completedCount={completedCount}
          estimatedMinutes={estimateWorkoutDuration(workout.exercises)}
          headerActions={headerActions}
          onPress={isCollapsible ? handleToggleExpand : undefined}>
          {isEditing ? (
            <WorkoutEditPanel
              workoutDate={workout.date}
              workoutName={workout.name}
              canChangeDate={moveRule.allowed}
              dateChangeDisabledMessage={!moveRule.allowed ? moveRule.message : undefined}
              exercises={workout.exercises}
              exercisesById={exercisesById}
              onNameChange={(name) =>
                mutations.updateWorkout.mutate({ ...workout, name })
              }
              onAddExercise={() =>
                plannerState.openSheet({ type: 'addExercise', workoutId: workout.id })
              }
              onAddTemplate={() =>
                plannerState.openSheet({ type: 'addTemplate', workoutId: workout.id })
              }
              onDateChange={handleDateChange}
              pendingDateConfirmation={pendingDate}
              onConfirmDateChange={() => {
                if (pendingDate) {
                  void applyDateChange(pendingDate);
                }
              }}
              onCancelDateChange={() => setPendingDate(null)}
              onRemoveExercise={(workoutExerciseId) =>
                mutations.removeExercise.mutate({ workoutId: workout.id, workoutExerciseId })
              }
              onReorder={(orderedIds) =>
                mutations.reorderExercises.mutate({ workoutId: workout.id, orderedIds })
              }
            />
          ) : isExpanded ? (
            <View className="mt-3 gap-1 border-t border-border pt-3">
              {sortedExercises.map((exercise) => (
                <PlannedExerciseRow
                  key={exercise.id}
                  workoutExercise={exercise}
                  exerciseName={
                    exercisesById.get(exercise.exerciseId)?.name ?? 'Unknown exercise'
                  }
                />
              ))}
            </View>
          ) : null}
        </WorkoutCard>
      </View>

      <ConfirmDialog
        confirmLabel="Move"
        description="This workout is currently in progress. Moving it to another date will keep your session data."
        hideTrigger
        open={Boolean(pendingDate)}
        title="Move in-progress workout?"
        triggerLabel="Move"
        onConfirm={() => {
          if (pendingDate) {
            void applyDateChange(pendingDate);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDate(null);
          }
        }}
      />

      <ConfirmDialog
        confirmLabel="Mark as Completed"
        cancelLabel="Mark as Skipped"
        description="Past workouts cannot stay planned. Choose how to record this workout."
        hideTrigger
        open={Boolean(pendingPastStatusDate)}
        title="Move to a past date?"
        triggerLabel="Mark as Completed"
        onConfirm={() => {
          if (pendingPastStatusDate) {
            void applyDateChange(pendingPastStatusDate, 'completed');
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPendingPastStatusDate(null);
          }
        }}
        onCancel={() => {
          if (pendingPastStatusDate) {
            void applyDateChange(pendingPastStatusDate, 'skipped');
          }
        }}
      />

      <ConfirmDialog
        confirmLabel="Delete"
        description="This will remove it from your history, dashboard metrics, and progress tracking."
        destructive
        hideTrigger
        open={pendingDelete}
        title="Delete workout?"
        triggerLabel="Delete"
        onConfirm={() => {
          mutations.deleteWorkout.mutate(workout.id);
          setPendingDelete(false);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(false);
          }
        }}
      />
    </>
  );
}
