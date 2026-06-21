import { PlannedExerciseRow } from '@/src/ui/workouts/components/PlannedExerciseRow';
import { createMockWorkoutExercise } from '@/test-utils/mockData';
import { render, screen } from '@testing-library/react-native';

describe('PlannedExerciseRow', () => {
  it('renders exercise name and planned prescription below it', () => {
    render(
      <PlannedExerciseRow
        workoutExercise={createMockWorkoutExercise({
          plannedSets: 2,
          plannedReps: 8,
          plannedWeight: 75,
          plannedHoldSeconds: 30,
        })}
        exerciseName="Leg Extension"
      />
    );

    expect(screen.getByText('Leg Extension')).toBeTruthy();
    expect(screen.getByText('2 x 8 • 75 lbs • 30 Sec Hold')).toBeTruthy();
  });

  it('renders only the exercise name when no prescription is set', () => {
    render(
      <PlannedExerciseRow
        workoutExercise={createMockWorkoutExercise()}
        exerciseName="Short Foot"
      />
    );

    expect(screen.getByText('Short Foot')).toBeTruthy();
    expect(screen.queryByText(/x|sets|reps|lbs/)).toBeNull();
  });

  it('renders actual prescription when the exercise is completed', () => {
    render(
      <PlannedExerciseRow
        workoutExercise={createMockWorkoutExercise({
          completed: true,
          plannedSets: 2,
          plannedReps: 8,
          plannedWeight: 75,
          actualSets: 2,
          actualReps: 10,
          actualWeight: 80,
        })}
        exerciseName="Leg Extension"
      />
    );

    expect(screen.getByText('2 x 10 • 80 lbs')).toBeTruthy();
    expect(screen.queryByText('2 x 8 • 75 lbs')).toBeNull();
  });
});
