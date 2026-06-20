jest.mock('@/src/ui/workouts/hooks/useWeekSwipeGesture', () => ({
  useWeekSwipeWithScrollGesture: jest.fn(() => ({})),
}));

jest.mock('@/src/ui/workouts/hooks/useExpandedWorkoutSwipeBlock', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ExpandedWorkoutSwipeBlockProvider: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    useExpandedWorkoutSwipeBlock: () => ({
      blockedRects: { value: [] },
      blockedRectsList: [],
      hasExpandedWorkouts: false,
      updateExpandedBounds: jest.fn(),
      clearExpandedBounds: jest.fn(),
    }),
  };
});

import { CalendarView } from '@/src/ui/workouts/views/CalendarView';
import { createMockExercise, createMockWorkout } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('@/src/ui/workouts/components/WeekNavigator', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    WeekNavigator: () => (
      <View>
        <Text>Week navigator</Text>
      </View>
    ),
  };
});

jest.mock('@/src/ui/workouts/components/DaySection', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    DaySection: () => (
      <View>
        <Text>Lower Body</Text>
      </View>
    ),
  };
});

jest.mock('@/src/ui/workouts/components/TemplateBlockPickerSheet', () => ({
  TemplateBlockPickerSheet: () => null,
}));

jest.mock('@/src/ui/workouts/components/ExercisePickerSheet', () => ({
  ExercisePickerSheet: () => null,
}));

jest.mock('@/src/ui/workouts/components/WorkoutCreateSheet', () => ({
  WorkoutCreateSheet: () => null,
}));

jest.mock('@/src/ui/workouts/components/DuplicateWorkoutSheet', () => ({
  DuplicateWorkoutSheet: () => null,
}));

jest.mock('@/src/ui/workouts/hooks/useWeeklyWorkouts', () => ({
  useWeeklyWorkouts: jest.fn(),
}));

jest.mock('@/src/ui/workouts/hooks/useWorkoutMutations', () => ({
  useWorkoutMutations: jest.fn(),
}));

jest.mock('@/src/ui/exercises/hooks/useExerciseLibrary', () => ({
  useExerciseLibrary: jest.fn(),
}));

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});

jest.mock('react-native-reanimated-dnd', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    DropProvider: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Sortable: () => null,
    SortableItem: Object.assign(() => null, { Handle: View }),
    Draggable: Object.assign(() => null, { Handle: View }),
    Droppable: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createPanGesture = () => {
    const gesture = {
      enabled: () => gesture,
      activeOffsetX: () => gesture,
      failOffsetY: () => gesture,
      onTouchesDown: () => gesture,
      onEnd: () => gesture,
    };
    return gesture;
  };
  return {
    Gesture: {
      Pan: createPanGesture,
      Native: createPanGesture,
      Simultaneous: (...gestures: unknown[]) => gestures[0],
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    ScrollView: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

import { useWeeklyWorkouts } from '@/src/ui/workouts/hooks/useWeeklyWorkouts';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';

const mockUseWeeklyWorkouts = useWeeklyWorkouts as jest.MockedFunction<typeof useWeeklyWorkouts>;
const mockUseWorkoutMutations = useWorkoutMutations as jest.MockedFunction<typeof useWorkoutMutations>;
const mockUseExerciseLibrary = useExerciseLibrary as jest.MockedFunction<typeof useExerciseLibrary>;

describe('CalendarView', () => {
  beforeEach(() => {
    mockUseWeeklyWorkouts.mockReturnValue({
      workouts: [
        createMockWorkout({
          id: 'workout-1',
          name: 'Lower Body',
          date: createTestDate(),
        }),
      ],
      weekStart: createTestDate(),
      weekEnd: createTestDate(6),
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseWorkoutMutations.mockReturnValue({
      createWorkout: { mutateAsync: jest.fn() } as never,
      addTemplateBlock: { mutateAsync: jest.fn() } as never,
      addExercise: { mutateAsync: jest.fn() } as never,
      removeExercise: { mutateAsync: jest.fn() } as never,
      reorderExercises: { mutateAsync: jest.fn() } as never,
      moveExercise: { mutateAsync: jest.fn() } as never,
      moveWorkout: { mutateAsync: jest.fn() } as never,
      duplicateWorkout: { mutateAsync: jest.fn() } as never,
      deleteWorkout: { mutate: jest.fn() } as never,
      revertWorkoutToPlanned: { mutate: jest.fn() } as never,
      startWorkout: { mutate: jest.fn() } as never,
      skipWorkout: { mutate: jest.fn() } as never,
      updateWorkout: { mutateAsync: jest.fn() } as never,
      isReady: true,
    });

    mockUseExerciseLibrary.mockReturnValue({
      exercises: [createMockExercise()],
      isLoading: false,
      isRefreshing: false,
      error: null,
      archiveExercise: jest.fn(),
      restoreExercise: jest.fn(),
      toggleFavorite: jest.fn(),
      deleteExercise: jest.fn(),
    });
  });

  it('renders calendar header and add workout button', () => {
    render(<CalendarView />);

    expect(screen.getByText('Calendar')).toBeTruthy();
    expect(screen.getByText('+ Add Workout')).toBeTruthy();
  });

  it('renders workout card', () => {
    render(<CalendarView />);

    expect(screen.getAllByText('Lower Body').length).toBeGreaterThan(0);
  });

  it('opens add workout sheet', () => {
    render(<CalendarView />);

    fireEvent.press(screen.getByText('+ Add Workout'));
    expect(screen.getByText('Select Date')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
  });
});
