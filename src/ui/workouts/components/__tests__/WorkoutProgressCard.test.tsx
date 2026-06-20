import { WorkoutProgressCard } from '@/src/ui/workouts/components/WorkoutProgressCard';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { render, screen } from '@testing-library/react-native';

describe('WorkoutProgressCard', () => {
  it('shows exercises completed, total, and percent complete', () => {
    render(
      <WorkoutProgressCard
        workout={createMockWorkout({
          exercises: [
            createMockWorkoutExercise({ id: 'we-1', completed: true }),
            createMockWorkoutExercise({ id: 'we-2', completed: false }),
          ],
        })}
      />
    );

    expect(screen.getByText('1 of 2 exercises complete')).toBeTruthy();
    expect(screen.getByText('50% complete')).toBeTruthy();
  });

  it('handles zero exercises gracefully', () => {
    render(<WorkoutProgressCard workout={createMockWorkout({ exercises: [] })} />);

    expect(screen.getByText('0 of 0 exercises complete')).toBeTruthy();
    expect(screen.getByText('0% complete')).toBeTruthy();
  });
});
