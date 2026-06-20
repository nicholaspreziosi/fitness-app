import { WorkoutListCard } from '@/src/ui/workouts/components/WorkoutListCard';
import { createMockWorkout } from '@/test-utils/mockData';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('WorkoutListCard', () => {
  it('shows Start Workout for planned workouts', () => {
    const onStart = jest.fn();
    render(
      <WorkoutListCard
        workout={createMockWorkout({ id: 'workout-1', status: 'planned', name: 'Lower Body' })}
        onStart={onStart}
        onResume={jest.fn()}
      />
    );

    expect(screen.getByText('Lower Body')).toBeTruthy();
    expect(screen.getByText('Planned')).toBeTruthy();
    expect(screen.getByText('Start Workout')).toBeTruthy();
  });

  it('calls onStart with workout id when Start Workout is pressed', () => {
    const onStart = jest.fn();
    render(
      <WorkoutListCard
        workout={createMockWorkout({ id: 'workout-1', status: 'planned' })}
        onStart={onStart}
        onResume={jest.fn()}
      />
    );

    fireEvent.press(screen.getByText('Start Workout'));
    expect(onStart).toHaveBeenCalledWith('workout-1');
  });

  it('shows Resume Workout for in-progress workouts', () => {
    const onResume = jest.fn();
    render(
      <WorkoutListCard
        workout={createMockWorkout({ id: 'workout-2', status: 'inProgress', name: 'Shoulder Rehab' })}
        onStart={jest.fn()}
        onResume={onResume}
      />
    );

    expect(screen.getByText('Shoulder Rehab')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Resume Workout')).toBeTruthy();
  });

  it('calls onResume with workout id when Resume Workout is pressed', () => {
    const onResume = jest.fn();
    render(
      <WorkoutListCard
        workout={createMockWorkout({ id: 'workout-2', status: 'inProgress' })}
        onStart={jest.fn()}
        onResume={onResume}
      />
    );

    fireEvent.press(screen.getByText('Resume Workout'));
    expect(onResume).toHaveBeenCalledWith('workout-2');
  });
});
