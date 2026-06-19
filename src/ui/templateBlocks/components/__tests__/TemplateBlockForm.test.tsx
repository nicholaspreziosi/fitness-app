import { TemplateBlockForm } from '@/src/ui/templateBlocks/components/TemplateBlockForm';
import { createMockExercise } from '@/test-utils/mockData';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

const exercises = [
  createMockExercise({ id: 'exercise-1', name: 'Pendulum Squat' }),
  createMockExercise({ id: 'exercise-2', name: 'Leg Press' }),
];

describe('TemplateBlockForm', () => {
  it('validates required fields', () => {
    const onSubmit = jest.fn();

    render(<TemplateBlockForm exercises={exercises} mode="create" onSubmit={onSubmit} />);

    fireEvent.press(screen.getByText('Save template'));

    expect(screen.getByText('Template name is required.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid template data as active from create mode', async () => {
    const onSubmit = jest.fn();

    render(<TemplateBlockForm exercises={exercises} mode="create" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByPlaceholderText('Template name'), 'Quad Strength');
    fireEvent.press(screen.getByTestId('add-exercise-exercise-1'));

    await act(async () => {
      fireEvent.press(screen.getByText('Save template'));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Quad Strength',
        status: 'active',
        exerciseIds: ['exercise-1'],
      })
    );
  });

  it('saves draft from create mode', async () => {
    const onSubmit = jest.fn();

    render(<TemplateBlockForm exercises={exercises} mode="create" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByPlaceholderText('Template name'), 'Quad Strength');

    await act(async () => {
      fireEvent.press(screen.getByText('Save draft'));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Quad Strength',
        status: 'draft',
        exerciseIds: [],
      })
    );
  });

  it('adds and removes exercises', () => {
    render(<TemplateBlockForm exercises={exercises} mode="create" onSubmit={jest.fn()} />);

    fireEvent.press(screen.getByTestId('add-exercise-exercise-1'));
    fireEvent.press(screen.getByTestId('add-exercise-exercise-2'));

    expect(screen.getByTestId('selected-exercise-exercise-1')).toBeTruthy();
    expect(screen.getByTestId('selected-exercise-exercise-2')).toBeTruthy();

    fireEvent.press(screen.getByTestId('remove-exercise-exercise-1'));

    expect(screen.queryByTestId('selected-exercise-exercise-1')).toBeNull();
    expect(screen.getByTestId('selected-exercise-exercise-2')).toBeTruthy();
  });

  it('submits edit mode with selected status', async () => {
    const onSubmit = jest.fn();

    render(
      <TemplateBlockForm
        exercises={exercises}
        mode="edit"
        initialValues={{
          name: 'Quad Strength',
          status: 'draft',
          exerciseIds: ['exercise-1'],
        }}
        onSubmit={onSubmit}
      />
    );

    fireEvent.press(screen.getByTestId('template-status-active'));

    await act(async () => {
      fireEvent.press(screen.getByText('Save template'));
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Quad Strength',
        status: 'active',
        exerciseIds: ['exercise-1'],
      })
    );
  });
});
