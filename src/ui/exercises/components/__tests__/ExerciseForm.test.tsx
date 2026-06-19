import { ExerciseForm } from '@/src/ui/exercises/components/ExerciseForm';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

describe('ExerciseForm', () => {
  it('validates required fields', () => {
    const onSubmit = jest.fn();

    render(<ExerciseForm mode="create" onSubmit={onSubmit} />);

    fireEvent.press(screen.getByText('Save exercise'));

    expect(screen.getByText('Exercise name is required.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid exercise data as active from create mode', async () => {
    const onSubmit = jest.fn();

    render(<ExerciseForm mode="create" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByPlaceholderText('Exercise name'), 'Pendulum Squat');
    fireEvent.changeText(screen.getByPlaceholderText('Sets'), '2');
    fireEvent.changeText(screen.getByPlaceholderText('Reps'), '8');
    fireEvent.changeText(screen.getByPlaceholderText('Weight (lbs)'), '100');

    await act(async () => {
      fireEvent.press(screen.getByText('Save exercise'));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pendulum Squat',
        status: 'active',
        defaultSets: 2,
        defaultReps: 8,
        defaultWeight: 100,
      })
    );
  });

  it('saves draft from create mode', async () => {
    const onSubmit = jest.fn();

    render(<ExerciseForm mode="create" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByPlaceholderText('Exercise name'), 'Wall Sit');

    await act(async () => {
      fireEvent.press(screen.getByText('Save draft'));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Wall Sit',
        status: 'draft',
      })
    );
  });

  it('hides status and section headers in create mode but keeps classification fields', () => {
    render(<ExerciseForm mode="create" onSubmit={jest.fn()} />);

    expect(screen.queryByText('Status')).toBeNull();
    expect(screen.queryByText('Basics')).toBeNull();
    expect(screen.queryByText('Classification')).toBeNull();
    expect(screen.getByText('Body part')).toBeTruthy();
    expect(screen.getByText('Defaults')).toBeTruthy();
  });

  it('shows validation error for invalid numbers', async () => {
    const onSubmit = jest.fn();

    render(<ExerciseForm mode="create" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByPlaceholderText('Exercise name'), 'Wall Sit');
    fireEvent.changeText(screen.getByPlaceholderText('Sets'), 'abc');

    await act(async () => {
      fireEvent.press(screen.getByText('Save exercise'));
    });

    expect(screen.getByText('Sets must be a positive whole number.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits edit mode with selected status', async () => {
    const onSubmit = jest.fn();

    render(<ExerciseForm mode="edit" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByPlaceholderText('Exercise name'), 'Pendulum Squat');
    fireEvent.press(screen.getByTestId('exercise-status-active'));

    await act(async () => {
      fireEvent.press(screen.getByText('Save exercise'));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pendulum Squat',
        status: 'active',
      })
    );
  });
});
