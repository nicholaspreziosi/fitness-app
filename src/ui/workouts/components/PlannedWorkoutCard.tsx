import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { sortWorkoutExercises } from '@/src/contexts/workouts/domain/planner.helpers';
import { canMoveWorkoutToDate } from '@/src/contexts/workouts/domain/planner.rules';
import { estimateWorkoutDuration } from '@/src/contexts/workouts/domain/workoutDuration';
import { isSameDay, startOfDay } from '@/src/lib/dates/weekBounds';
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
  ArchiveIcon,
  ChevronDownIcon,
  CopyIcon,
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

function buildMenuItems(
  workout: Workout,
  plannerState: PlannerState,
  mutations: ReturnType<typeof useWorkoutMutations>,
  onDelete: () => void
): PopoverMenuItem[] {
  switch (workout.status) {
    case 'draft':
      return [
        {
          label: 'Delete',
          icon: Trash2Icon,
          destructive: true,
          testID: 'delete-workout',
          onPress: onDelete,
        },
      ];
    case 'planned':
      return [
        {
          label: 'Duplicate',
          icon: CopyIcon,
          testID: 'duplicate-workout',
          onPress: () =>
            plannerState.openSheet({ type: 'duplicateWorkout', workoutId: workout.id }),
        },
        {
          label: 'Delete',
          icon: Trash2Icon,
          destructive: true,
          testID: 'delete-workout',
          onPress: onDelete,
        },
      ];
    case 'inProgress':
      return [
        {
          label: 'Skip',
          icon: SkipForwardIcon,
          testID: 'skip-workout',
          onPress: () => mutations.skipWorkout.mutate(workout.id),
        },
      ];
    case 'completed':
    case 'skipped':
      return [
        {
          label: 'Duplicate',
          icon: CopyIcon,
          testID: 'duplicate-workout',
          onPress: () =>
            plannerState.openSheet({ type: 'duplicateWorkout', workoutId: workout.id }),
        },
        {
          label: 'Archive',
          icon: ArchiveIcon,
          testID: 'archive-workout',
          onPress: () => mutations.archiveWorkout.mutate(workout.id),
        },
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
    async (date: Date) => {
      await mutations.moveWorkout.mutateAsync({
        workoutId: workout.id,
        date,
        confirmed: moveRule.allowed && moveRule.requiresConfirmation ? true : undefined,
      });
      plannerState.setWeekAnchor(startOfDay(date));
      setPendingDate(null);
    },
    [mutations.moveWorkout, moveRule, plannerState, workout.id]
  );

  const handleDateChange = React.useCallback(
    (date: Date) => {
      if (isSameDay(date, workout.date) || !moveRule.allowed) {
        return;
      }

      if (moveRule.requiresConfirmation) {
        setPendingDate(date);
        return;
      }

      void applyDateChange(date);
    },
    [applyDateChange, moveRule, workout.date]
  );

  const canToggleEdit = canEnterEditMode(workout.status);
  const isCollapsible = workout.status !== 'archived';
  const cardRef = React.useRef<View>(null);
  const measureExpandedBounds = useRegisterExpandedWorkoutSwipeBlock(
    workout.id,
    isExpanded,
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
        onLayout={isExpanded ? measureExpandedBounds : undefined}>
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
              canChangeDate={moveRule.allowed}
              dateChangeDisabledMessage={!moveRule.allowed ? moveRule.message : undefined}
              exercises={workout.exercises}
              exercisesById={exercisesById}
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
                  exerciseName={exercisesById.get(exercise.exerciseId)?.name ?? 'Unknown exercise'}
                />
              ))}
            </View>
          ) : null}
        </WorkoutCard>
      </View>

      <ConfirmDialog
        confirmLabel="Delete"
        description={`"${workout.name}" will be permanently deleted. This cannot be undone.`}
        destructive
        hideTrigger
        open={pendingDelete}
        title="Delete this workout?"
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
