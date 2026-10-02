import { DuplicateWorkoutSheet } from '@/src/ui/workouts/components/DuplicateWorkoutSheet';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

jest.mock('@/src/ui/workouts/hooks/useWorkoutMutations', () => ({
  useWorkoutMutations: jest.fn(),
}));

const pickedDate = new Date(2024, 6, 3);

jest.mock('@/components/ui/date-picker', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    InlineDatePicker: ({ value, onChange }: { value: Date; onChange: (date: Date) => void }) => (
      <Pressable testID="inline-date-picker" onPress={() => onChange(new Date(2024, 6, 3))}>
        <Text>{`Picker at ${value.toISOString().slice(0, 10)}`}</Text>
      </Pressable>
    ),
  };
});

const useWorkoutMutationsMock = jest.mocked(useWorkoutMutations);

describe('DuplicateWorkoutSheet', () => {
  const mutateAsync = jest.fn();

  beforeEach(() => {
    mutateAsync.mockReset();
    useWorkoutMutationsMock.mockReturnValue({
      duplicateWorkout: { mutateAsync },
    } as unknown as ReturnType<typeof useWorkoutMutations>);
  });

  it('starts the picker on the initial date', () => {
    render(
      <DuplicateWorkoutSheet
        workoutId="w-1"
        initialDate={new Date(2024, 5, 18, 9)}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Picker at 2024-06-18')).toBeTruthy();
  });

  it('duplicates onto the tapped day and closes', async () => {
    mutateAsync.mockResolvedValue(undefined);
    const onClose = jest.fn();
    const onDuplicated = jest.fn();

    render(<DuplicateWorkoutSheet workoutId="w-1" onClose={onClose} onDuplicated={onDuplicated} />);

    fireEvent.press(screen.getByTestId('inline-date-picker'));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(mutateAsync).toHaveBeenCalledWith({ workoutId: 'w-1', targetDate: pickedDate });
    expect(onDuplicated).toHaveBeenCalledWith(pickedDate);
  });

  it('ignores further taps while a duplicate is in flight', async () => {
    let resolveMutation: () => void = () => undefined;
    mutateAsync.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveMutation = resolve;
        })
    );
    const onClose = jest.fn();

    render(<DuplicateWorkoutSheet workoutId="w-1" onClose={onClose} />);

    fireEvent.press(screen.getByTestId('inline-date-picker'));
    fireEvent.press(screen.getByTestId('inline-date-picker'));

    expect(mutateAsync).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveMutation();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
