import { WorkoutCreateSheet } from '@/src/ui/workouts/components/WorkoutCreateSheet';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockCreateWorkout = jest.fn();

jest.mock('@/src/ui/workouts/hooks/useWorkoutMutations', () => ({
  useWorkoutMutations: () => ({
    createWorkout: {
      mutateAsync: mockCreateWorkout,
      isPending: false,
    },
  }),
}));

describe('WorkoutCreateSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
    mockCreateWorkout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a planned workout for today or future dates', async () => {
    const onClose = jest.fn();

    render(
      <WorkoutCreateSheet date={createTestDate(1)} onClose={onClose} />
    );

    fireEvent.changeText(screen.getByPlaceholderText('Wednesday Lower Body'), 'Friday Upper Body');
    fireEvent.press(screen.getByText('Create'));

    expect(mockCreateWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Friday Upper Body',
        date: createTestDate(1),
        status: 'planned',
      })
    );
  });

  it('prompts for completed or skipped when creating on a past date', async () => {
    render(<WorkoutCreateSheet date={createTestDate(-1)} onClose={jest.fn()} />);

    expect(screen.getByTestId('past-workout-status')).toBeTruthy();
    expect(screen.getByText('Past workouts are recorded as completed or skipped.')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Wednesday Lower Body'), 'Missed Workout');
    fireEvent.press(screen.getByText('Create'));

    expect(mockCreateWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Missed Workout',
        date: createTestDate(-1),
        status: 'completed',
      })
    );
  });
});
