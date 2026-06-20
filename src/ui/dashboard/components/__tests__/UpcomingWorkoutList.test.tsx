import { UpcomingWorkoutList } from '@/src/ui/dashboard/components/UpcomingWorkoutList';
import { UpcomingWorkoutRow } from '@/src/ui/dashboard/components/UpcomingWorkoutRow';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { render, screen } from '@testing-library/react-native';

describe('UpcomingWorkoutRow', () => {
  it('renders day, workout name, exercise count, and estimated duration', () => {
    const workout = createMockWorkout({
      name: 'Push Pull',
      date: createTestDate(2),
      exercises: [
        createMockWorkoutExercise({ plannedSets: 3 }),
        createMockWorkoutExercise({ id: 'we-2', plannedSets: 3 }),
      ],
    });

    render(<UpcomingWorkoutRow workout={workout} testID="upcoming-row" />);

    expect(screen.getByTestId('upcoming-row')).toBeTruthy();
    expect(screen.getByText('Push Pull')).toBeTruthy();
    expect(screen.getByText(/2 exercises/)).toBeTruthy();
    expect(screen.getByText(/~\d+ min/)).toBeTruthy();
  });
});

describe('UpcomingWorkoutList', () => {
  it('renders upcoming workouts', () => {
    const workouts = [
      createMockWorkout({ id: 'workout-1', name: 'Lower Body', date: createTestDate(1) }),
      createMockWorkout({ id: 'workout-2', name: 'Push Pull', date: createTestDate(3) }),
    ];

    render(<UpcomingWorkoutList workouts={workouts} />);

    expect(screen.getByTestId('upcoming-workout-list')).toBeTruthy();
    expect(screen.getByText('Lower Body')).toBeTruthy();
    expect(screen.getByText('Push Pull')).toBeTruthy();
  });

  it('shows empty state when there are no upcoming workouts', () => {
    render(<UpcomingWorkoutList workouts={[]} isEmpty />);

    expect(screen.getByTestId('upcoming-workout-list-empty')).toBeTruthy();
    expect(screen.getByText('No upcoming workouts for this period.')).toBeTruthy();
  });
});
