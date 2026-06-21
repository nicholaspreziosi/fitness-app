import { WorkoutListView } from '@/src/ui/workouts/views/WorkoutListView';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockStart = jest.fn();
const mockResume = jest.fn();

jest.mock('@/src/ui/workouts/hooks/useTodayActiveWorkouts', () => ({
  useTodayActiveWorkouts: jest.fn(),
}));

jest.mock('@/src/ui/workouts/hooks/useWorkoutSession', () => ({
  useWorkoutSession: () => ({
    start: mockStart,
    resume: mockResume,
    exit: jest.fn(),
    finish: jest.fn(),
    skip: jest.fn(),
  }),
}));

jest.mock('@/src/ui/shared/components/ScreenContainer', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { ScreenContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});

import { useTodayActiveWorkouts } from '@/src/ui/workouts/hooks/useTodayActiveWorkouts';

const useTodayActiveWorkoutsMock = useTodayActiveWorkouts as jest.MockedFunction<
  typeof useTodayActiveWorkouts
>;

describe('WorkoutListView', () => {
  const today = createTestDate();

  beforeEach(() => {
    jest.clearAllMocks();
    useTodayActiveWorkoutsMock.mockReturnValue({
      workouts: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefreshing: false,
    });
  });

  it('shows empty state when there are no active workouts today', () => {
    render(<WorkoutListView today={today} onNavigateToMode={jest.fn()} onNavigateToList={jest.fn()} />);

    expect(screen.getByText("Today's Workout")).toBeTruthy();
    expect(screen.getByText('No planned or in-progress workouts today.')).toBeTruthy();
    expect(screen.queryByText('Create Workout')).toBeNull();
  });

  it('renders planned and in-progress workout cards', () => {
    useTodayActiveWorkoutsMock.mockReturnValue({
      workouts: [
        createMockWorkout({ id: 'planned-1', status: 'planned', name: 'Lower Body' }),
        createMockWorkout({ id: 'active-1', status: 'inProgress', name: 'Shoulder Rehab' }),
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefreshing: false,
    });

    render(<WorkoutListView today={today} onNavigateToMode={jest.fn()} onNavigateToList={jest.fn()} />);

    expect(screen.getByText('Lower Body')).toBeTruthy();
    expect(screen.getByText('Shoulder Rehab')).toBeTruthy();
    expect(screen.getByText('Start Workout')).toBeTruthy();
    expect(screen.getByText('Resume Workout')).toBeTruthy();
  });

  it('starts workout through session hook', async () => {
    useTodayActiveWorkoutsMock.mockReturnValue({
      workouts: [createMockWorkout({ id: 'planned-1', status: 'planned', name: 'Lower Body' })],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefreshing: false,
    });

    render(<WorkoutListView today={today} onNavigateToMode={jest.fn()} onNavigateToList={jest.fn()} />);

    fireEvent.press(screen.getByText('Start Workout'));
    expect(mockStart).toHaveBeenCalledWith('planned-1');
  });
});
