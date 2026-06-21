jest.mock('@/src/ui/workouts/hooks/useExpandedWorkoutSwipeBlock', () => ({
  useRegisterExpandedWorkoutSwipeBlock: () => jest.fn(),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: unknown) => component,
    },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withTiming: (value: number) => value,
  };
});

jest.mock('@/src/ui/shared/components/PopoverMenu', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    PopoverMenu: ({
      items,
      triggerTestID,
    }: {
      items: Array<{ label: string; onPress: () => void; testID?: string }>;
      triggerTestID?: string;
    }) => (
      <View>
        <Pressable testID={triggerTestID}>
          <Text>Menu</Text>
        </Pressable>
        {items.map((item) => (
          <Pressable key={item.label} testID={item.testID} onPress={item.onPress}>
            <Text>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('@/src/ui/shared/components/ConfirmDialog', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    ConfirmDialog: ({
      open,
      title,
      description,
      confirmLabel,
      onConfirm,
    }: {
      open?: boolean;
      title: string;
      description: string;
      confirmLabel?: string;
      onConfirm?: () => void;
    }) =>
      open ? (
        <View>
          <Text>{title}</Text>
          <Text>{description}</Text>
          <Pressable testID="confirm-delete" onPress={onConfirm}>
            <Text>{confirmLabel}</Text>
          </Pressable>
        </View>
      ) : null,
  };
});

jest.mock('@/src/ui/workouts/components/WorkoutEditPanel', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  const { canEditWorkoutExercises } = require('@/src/contexts/workouts/domain/planner.rules');

  return {
    WorkoutEditPanel: () => (
      <View>
        <Text>Edit panel</Text>
      </View>
    ),
    canEnterEditMode: (status: Parameters<typeof canEditWorkoutExercises>[0]) =>
      canEditWorkoutExercises(status).allowed,
  };
});

import { PlannedWorkoutCard } from '@/src/ui/workouts/components/PlannedWorkoutCard';
import type { PlannerState } from '@/src/ui/workouts/hooks/usePlannerState';
import type { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import { createMockExercise, createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';

function createPlannerState(overrides: Partial<PlannerState> = {}): PlannerState {
  return {
    weekAnchor: new Date(),
    setWeekAnchor: jest.fn(),
    expandedWorkoutId: null,
    editingWorkoutId: null,
    activeSheet: { type: 'none' },
    dropMessage: null,
    enterEditMode: jest.fn(),
    exitEditMode: jest.fn(),
    toggleExpanded: jest.fn(),
    openSheet: jest.fn(),
    closeSheet: jest.fn(),
    showDropMessage: jest.fn(),
    clearDropMessage: jest.fn(),
    ...overrides,
  };
}

function createMutations(
  overrides: Partial<ReturnType<typeof useWorkoutMutations>> = {}
): ReturnType<typeof useWorkoutMutations> {
  return {
    createWorkout: { mutateAsync: jest.fn() } as never,
    addTemplateBlock: { mutateAsync: jest.fn() } as never,
    addExercise: { mutateAsync: jest.fn() } as never,
    removeExercise: { mutate: jest.fn() } as never,
    reorderExercises: { mutate: jest.fn() } as never,
    moveExercise: { mutateAsync: jest.fn() } as never,
    moveWorkout: { mutateAsync: jest.fn() } as never,
    duplicateWorkout: { mutateAsync: jest.fn() } as never,
    deleteWorkout: { mutate: jest.fn() } as never,
    revertWorkoutToPlanned: { mutate: jest.fn() } as never,
    startWorkout: { mutate: jest.fn() } as never,
    resumeWorkout: { mutate: jest.fn() } as never,
    completeWorkout: { mutate: jest.fn() } as never,
    exitWorkout: { mutate: jest.fn() } as never,
    skipWorkout: { mutate: jest.fn() } as never,
    updateWorkoutExercise: { mutate: jest.fn() } as never,
    updateWorkout: { mutate: jest.fn() } as never,
    isReady: true,
    ...overrides,
  };
}

describe('PlannedWorkoutCard', () => {
  const exercisesById = new Map([
    ['exercise-1', createMockExercise({ id: 'exercise-1', name: 'Pendulum Squat' })],
  ]);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(['planned', 'inProgress'] as const)(
    'shows both status actions for past %s workouts',
    (status) => {
      render(
        <PlannedWorkoutCard
          workout={createMockWorkout({
            id: 'workout-1',
            status,
            date: createTestDate(-1),
          })}
          exercisesById={exercisesById}
          plannerState={createPlannerState()}
          mutations={createMutations()}
        />
      );

      expect(screen.getByText('Mark as Completed')).toBeTruthy();
      expect(screen.getByText('Mark as Skipped')).toBeTruthy();
      expect(screen.getByText('Duplicate')).toBeTruthy();
      expect(screen.queryByText('Mark as planned')).toBeNull();
    }
  );

  it('shows only Mark as Skipped for past completed workouts', () => {
    render(
      <PlannedWorkoutCard
        workout={createMockWorkout({
          id: 'workout-1',
          status: 'completed',
          date: createTestDate(-1),
        })}
        exercisesById={exercisesById}
        plannerState={createPlannerState()}
        mutations={createMutations()}
      />
    );

    expect(screen.queryByText('Mark as Completed')).toBeNull();
    expect(screen.getByText('Mark as Skipped')).toBeTruthy();
  });

  it('shows only Mark as Completed for past skipped workouts', () => {
    render(
      <PlannedWorkoutCard
        workout={createMockWorkout({
          id: 'workout-1',
          status: 'skipped',
          date: createTestDate(-1),
        })}
        exercisesById={exercisesById}
        plannerState={createPlannerState()}
        mutations={createMutations()}
      />
    );

    expect(screen.getByText('Mark as Completed')).toBeTruthy();
    expect(screen.queryByText('Mark as Skipped')).toBeNull();
  });

  it('does not show past workout status actions for today or future planned workouts', () => {
    render(
      <PlannedWorkoutCard
        workout={createMockWorkout({
          id: 'workout-1',
          status: 'planned',
          date: createTestDate(1),
        })}
        exercisesById={exercisesById}
        plannerState={createPlannerState()}
        mutations={createMutations()}
      />
    );

    expect(screen.queryByText('Mark as Completed')).toBeNull();
    expect(screen.queryByText('Mark as Skipped')).toBeNull();
    expect(screen.getByText('Duplicate')).toBeTruthy();
  });

  it('shows Mark as planned for future completed workouts', () => {
    render(
      <PlannedWorkoutCard
        workout={createMockWorkout({
          id: 'workout-1',
          status: 'completed',
          date: createTestDate(1),
        })}
        exercisesById={exercisesById}
        plannerState={createPlannerState()}
        mutations={createMutations()}
      />
    );

    expect(screen.getByText('Mark as planned')).toBeTruthy();
    expect(screen.queryByText('Mark as Completed')).toBeNull();
  });

  it('opens delete confirmation with updated copy and deletes on confirm', () => {
    const deleteWorkout = { mutate: jest.fn() };

    render(
      <PlannedWorkoutCard
        workout={createMockWorkout({
          id: 'workout-1',
          status: 'completed',
          date: createTestDate(-1),
          name: 'Lower Body',
        })}
        exercisesById={exercisesById}
        plannerState={createPlannerState()}
        mutations={createMutations({ deleteWorkout: deleteWorkout as never })}
      />
    );

    fireEvent.press(screen.getByTestId('delete-workout'));

    expect(screen.getByText('Delete workout?')).toBeTruthy();
    expect(
      screen.getByText(
        'This will remove it from your history, dashboard metrics, and progress tracking.'
      )
    ).toBeTruthy();

    fireEvent.press(screen.getByTestId('confirm-delete'));

    expect(deleteWorkout.mutate).toHaveBeenCalledWith('workout-1');
  });

  it('calls completeWorkout when Mark as Completed is pressed on a past workout', () => {
    const completeWorkout = { mutate: jest.fn() };

    render(
      <PlannedWorkoutCard
        workout={createMockWorkout({
          id: 'workout-1',
          status: 'skipped',
          date: createTestDate(-1),
        })}
        exercisesById={exercisesById}
        plannerState={createPlannerState()}
        mutations={createMutations({ completeWorkout: completeWorkout as never })}
      />
    );

    fireEvent.press(screen.getByTestId('complete-workout'));

    expect(completeWorkout.mutate).toHaveBeenCalledWith('workout-1');
  });

  it('calls skipWorkout when Mark as Skipped is pressed on a past workout', () => {
    const skipWorkout = { mutate: jest.fn() };

    render(
      <PlannedWorkoutCard
        workout={createMockWorkout({
          id: 'workout-1',
          status: 'completed',
          date: createTestDate(-1),
        })}
        exercisesById={exercisesById}
        plannerState={createPlannerState()}
        mutations={createMutations({ skipWorkout: skipWorkout as never })}
      />
    );

    fireEvent.press(screen.getByTestId('skip-workout'));

    expect(skipWorkout.mutate).toHaveBeenCalledWith('workout-1');
  });

  it.each(['completed', 'skipped'] as const)(
    'enters edit mode for %s workouts when expanded',
    (status) => {
      const enterEditMode = jest.fn();

      render(
        <PlannedWorkoutCard
          workout={createMockWorkout({ id: 'workout-1', status, date: createTestDate(-1) })}
          exercisesById={exercisesById}
          plannerState={createPlannerState({ enterEditMode })}
          mutations={createMutations()}
        />
      );

      fireEvent.press(screen.getByTestId('workout-expand'));

      expect(enterEditMode).toHaveBeenCalledWith('workout-1');
    }
  );

  it('renders edit panel when editing a completed workout', () => {
    render(
      <PlannedWorkoutCard
        workout={createMockWorkout({
          id: 'workout-1',
          status: 'completed',
          date: createTestDate(-1),
        })}
        exercisesById={exercisesById}
        plannerState={createPlannerState({
          editingWorkoutId: 'workout-1',
          expandedWorkoutId: 'workout-1',
        })}
        mutations={createMutations()}
      />
    );

    expect(screen.getByText('Edit panel')).toBeTruthy();
  });
});
