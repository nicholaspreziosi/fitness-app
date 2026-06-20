import { WorkoutTabView } from '@/src/ui/workouts/views/WorkoutTabView';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { render, screen } from '@testing-library/react-native';

const mockWorkoutListView = jest.fn(() => null);
const mockWorkoutModeView = jest.fn(() => null);

jest.mock('@/src/ui/workouts/views/WorkoutListView', () => ({
  WorkoutListView: (props: unknown) => {
    mockWorkoutListView(props);
    const React = require('react');
    const { Text, View } = require('react-native');
    return (
      <View>
        <Text>Workout list view</Text>
      </View>
    );
  },
}));

jest.mock('@/src/ui/workouts/views/WorkoutModeView', () => ({
  WorkoutModeView: (props: unknown) => {
    mockWorkoutModeView(props);
    const React = require('react');
    const { Text, View } = require('react-native');
    return (
      <View>
        <Text>Workout mode view</Text>
      </View>
    );
  },
}));

jest.mock('@/src/ui/shared/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

jest.mock('@/src/ui/workouts/hooks/useTodayActiveWorkouts', () => ({
  useTodayActiveWorkouts: jest.fn(),
}));

jest.mock('@/src/ui/workouts/hooks/useWeeklyWorkouts', () => ({
  useWeeklyWorkouts: jest.fn(),
}));

jest.mock('@/src/ui/exercises/hooks/useExerciseLibrary', () => ({
  useExerciseLibrary: jest.fn(() => ({
    exercises: [],
    isLoading: false,
  })),
}));

jest.mock('@/src/ui/workouts/hooks/useWorkoutAutoSave', () => ({
  useWorkoutAutoSave: jest.fn(() => ({
    saveExerciseChange: jest.fn(),
    saveStatus: 'idle',
    saveError: null,
  })),
}));

jest.mock('@/src/ui/workouts/hooks/useWorkoutSession', () => ({
  useWorkoutSession: jest.fn(() => ({
    start: jest.fn(),
    resume: jest.fn(),
    exit: jest.fn(),
    finish: jest.fn(),
    skip: jest.fn(),
  })),
}));

jest.mock('@/src/ui/workouts/hooks/useProgressionPrompt', () => ({
  useProgressionPrompt: jest.fn(() => ({
    reviews: [],
    isOpen: false,
    openForWorkout: jest.fn(),
    close: jest.fn(),
    applySelectedUpdates: jest.fn(),
    skipAll: jest.fn(),
  })),
}));

jest.mock('@/src/ui/workouts/components/ProgressionPromptSheet', () => ({
  ProgressionPromptSheet: () => null,
}));

import { useTodayActiveWorkouts } from '@/src/ui/workouts/hooks/useTodayActiveWorkouts';
import { useWeeklyWorkouts } from '@/src/ui/workouts/hooks/useWeeklyWorkouts';

const useTodayActiveWorkoutsMock = useTodayActiveWorkouts as jest.MockedFunction<
  typeof useTodayActiveWorkouts
>;
const useWeeklyWorkoutsMock = useWeeklyWorkouts as jest.MockedFunction<typeof useWeeklyWorkouts>;

describe('WorkoutTabView', () => {
  const today = createTestDate();

  beforeEach(() => {
    jest.clearAllMocks();
    useTodayActiveWorkoutsMock.mockReturnValue({
      workouts: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    useWeeklyWorkoutsMock.mockReturnValue({
      workouts: [],
      weekStart: today,
      weekEnd: today,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('shows workout list when there is no active session', () => {
    render(<WorkoutTabView today={today} />);
    expect(screen.getByText('Workout list view')).toBeTruthy();
    expect(screen.queryByText('Workout mode view')).toBeNull();
  });

  it('auto-opens workout mode when an in-progress workout has activeSession true', () => {
    useTodayActiveWorkoutsMock.mockReturnValue({
      workouts: [
        createMockWorkout({
          id: 'workout-1',
          status: 'inProgress',
          activeSession: true,
          name: 'Active Session',
        }),
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    useWeeklyWorkoutsMock.mockReturnValue({
      workouts: [
        createMockWorkout({
          id: 'workout-1',
          status: 'inProgress',
          activeSession: true,
          name: 'Active Session',
        }),
      ],
      weekStart: today,
      weekEnd: today,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<WorkoutTabView today={today} />);

    expect(screen.getByText('Workout mode view')).toBeTruthy();
    expect(mockWorkoutModeView).toHaveBeenCalledWith(
      expect.objectContaining({
        workout: expect.objectContaining({ id: 'workout-1', name: 'Active Session' }),
      })
    );
  });

  it('shows workout list with start buttons for planned workouts without active session', () => {
    useTodayActiveWorkoutsMock.mockReturnValue({
      workouts: [createMockWorkout({ id: 'planned-1', status: 'planned' })],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<WorkoutTabView today={today} />);

    expect(screen.getByText('Workout list view')).toBeTruthy();
  });

  it('shows workout list with resume for paused in-progress workouts', () => {
    useTodayActiveWorkoutsMock.mockReturnValue({
      workouts: [
        createMockWorkout({
          id: 'paused-1',
          status: 'inProgress',
          activeSession: false,
        }),
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<WorkoutTabView today={today} />);

    expect(screen.getByText('Workout list view')).toBeTruthy();
  });
});
