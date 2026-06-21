import { WorkoutExerciseCard } from '@/src/ui/workouts/components/WorkoutExerciseCard';
import { createMockWorkoutExercise } from '@/test-utils/mockData';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('WorkoutExerciseCard', () => {
  it('toggles completed state without expanding the card', () => {
    const onChange = jest.fn();
    render(
      <WorkoutExerciseCard
        exercise={createMockWorkoutExercise({ id: 'we-1', completed: false })}
        exerciseName="Pendulum Squat"
        onChange={onChange}
      />
    );

    fireEvent.press(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith({ completed: true });
    expect(screen.queryByLabelText('Actual Reps')).toBeNull();
  });

  it('shows collapsed prescription summary', () => {
    render(
      <WorkoutExerciseCard
        exercise={createMockWorkoutExercise({
          id: 'we-1',
          plannedSets: 2,
          plannedReps: 10,
          plannedWeight: 50,
          plannedHoldSeconds: 5,
        })}
        exerciseName="Pendulum Squat"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
    expect(screen.getByText('2 x 10 • 50 lbs • 5 Sec Hold')).toBeTruthy();
  });

  it('shows actual prescription summary when completed', () => {
    render(
      <WorkoutExerciseCard
        exercise={createMockWorkoutExercise({
          id: 'we-1',
          completed: true,
          plannedSets: 2,
          plannedReps: 8,
          plannedWeight: 100,
          actualSets: 2,
          actualReps: 10,
          actualWeight: 105,
        })}
        exerciseName="Pendulum Squat"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('2 x 10 • 105 lbs')).toBeTruthy();
    expect(screen.queryByText('2 x 8 • 100 lbs')).toBeNull();
  });

  it('expands to show actual fields when the summary is pressed', () => {
    render(
      <WorkoutExerciseCard
        exercise={createMockWorkoutExercise({
          id: 'we-1',
          plannedSets: 2,
          plannedReps: 8,
          plannedWeight: 100,
          actualSets: 2,
          actualReps: 8,
          actualWeight: 105,
        })}
        exerciseName="Pendulum Squat"
        onChange={jest.fn()}
      />
    );

    fireEvent.press(screen.getByLabelText('Pendulum Squat, 2 x 8 • 100 lbs'));

    expect(screen.getByLabelText('Actual Sets')).toBeTruthy();
    expect(screen.getByDisplayValue('2')).toBeTruthy();
    expect(screen.getByDisplayValue('8')).toBeTruthy();
    expect(screen.getByDisplayValue('105')).toBeTruthy();
  });

  it('expands when the chevron is pressed', () => {
    render(
      <WorkoutExerciseCard
        exercise={createMockWorkoutExercise({
          id: 'we-1',
          plannedReps: 8,
          actualReps: 8,
        })}
        exerciseName="Leg Press"
        onChange={jest.fn()}
      />
    );

    fireEvent.press(screen.getByLabelText('Expand exercise'));
    expect(screen.getByLabelText('Actual Reps')).toBeTruthy();
  });

  it('hides hold field when no planned hold duration', () => {
    render(
      <WorkoutExerciseCard
        exercise={createMockWorkoutExercise({ id: 'we-1', plannedReps: 8, actualReps: 8 })}
        exerciseName="Leg Press"
        onChange={jest.fn()}
      />
    );

    fireEvent.press(screen.getByLabelText('Expand exercise'));
    expect(screen.queryByLabelText('Actual Hold (sec)')).toBeNull();
  });

  it('shows hold field when planned hold duration exists', () => {
    render(
      <WorkoutExerciseCard
        exercise={createMockWorkoutExercise({
          id: 'we-1',
          plannedHoldSeconds: 45,
          actualHoldSeconds: 50,
        })}
        exerciseName="Wall Sit"
        onChange={jest.fn()}
      />
    );

    fireEvent.press(screen.getByLabelText('Expand exercise'));
    expect(screen.getByLabelText('Actual Hold (sec)')).toBeTruthy();
    expect(screen.getByDisplayValue('50')).toBeTruthy();
  });

  it('calls onChange when actual reps are edited in expanded view', () => {
    const onChange = jest.fn();
    render(
      <WorkoutExerciseCard
        exercise={createMockWorkoutExercise({
          id: 'we-1',
          plannedReps: 8,
          actualReps: 8,
        })}
        exerciseName="Leg Press"
        onChange={onChange}
      />
    );

    fireEvent.press(screen.getByLabelText('Expand exercise'));
    fireEvent.changeText(screen.getByLabelText('Actual Reps'), '10');
    expect(onChange).toHaveBeenCalledWith({ actualReps: 10 });
  });
});
