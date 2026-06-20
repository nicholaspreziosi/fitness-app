import {
  buildDefaultUpdatesFromReviewItems,
  detectPlannedVsActualIncreases,
} from '@/src/contexts/workouts/domain/progression';
import { ProgressionPromptSheet } from '@/src/ui/workouts/components/ProgressionPromptSheet';
import { useProgressionPrompt } from '@/src/ui/workouts/hooks/useProgressionPrompt';
import { createMockExercise, createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

const mockUpdateExercise = jest.fn();

jest.mock('@/src/contexts/exercises/application/createExerciseService', () => ({
  createExerciseService: jest.fn(() => ({
    updateExercise: mockUpdateExercise,
  })),
}));

jest.mock('@/src/ui/shared/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

jest.mock('@/src/ui/exercises/hooks/useExerciseLibrary', () => ({
  useExerciseLibrary: jest.fn(),
}));

import { useExerciseLibrary } from '@/src/ui/exercises/hooks/useExerciseLibrary';

const useExerciseLibraryMock = useExerciseLibrary as jest.MockedFunction<typeof useExerciseLibrary>;

function ProgressionPromptHarness() {
  const prompt = useProgressionPrompt();

  return (
    <>
      <ProgressionPromptSheet
        reviews={prompt.reviews}
        isOpen={prompt.isOpen}
        onApply={prompt.applySelectedUpdates}
        onSkip={prompt.skipAll}
        onClose={prompt.close}
      />
      <ButtonHarness onOpen={() => prompt.openForWorkout(createCompletedWorkout())} />
    </>
  );
}

function ButtonHarness({ onOpen }: { onOpen: () => void }) {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return (
    <Pressable onPress={onOpen}>
      <Text>Open prompt</Text>
    </Pressable>
  );
}

function createCompletedWorkout() {
  return createMockWorkout({
    exercises: [
      createMockWorkoutExercise({
        exerciseId: 'exercise-1',
        plannedWeight: 100,
        plannedReps: 8,
        plannedSets: 2,
        actualWeight: 110,
        actualReps: 10,
        actualSets: 2,
        completed: true,
      }),
    ],
  });
}

describe('ProgressionPromptSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useExerciseLibraryMock.mockReturnValue({
      exercises: [
        createMockExercise({
          id: 'exercise-1',
          name: 'Pendulum Squat',
          defaultWeight: 100,
          defaultReps: 8,
          defaultSets: 2,
        }),
      ],
      isLoading: false,
      isError: false,
      error: null,
      archiveExercise: { mutateAsync: jest.fn() } as never,
      restoreExercise: { mutateAsync: jest.fn() } as never,
      toggleFavorite: jest.fn(),
    });
    mockUpdateExercise.mockResolvedValue(undefined);
  });

  it('opens a single review dialog when actual exceeds planned', () => {
    render(<ProgressionPromptHarness />);

    fireEvent.press(screen.getByText('Open prompt'));

    expect(screen.getByText('Update exercise defaults?')).toBeTruthy();
    expect(screen.getByText('Pendulum Squat')).toBeTruthy();
    expect(screen.getByLabelText('Weight (lbs): 100 → 110')).toBeTruthy();
    expect(screen.getByLabelText('Reps: 8 → 10')).toBeTruthy();
    expect(
      detectPlannedVsActualIncreases({ plannedWeight: 100, plannedReps: 8 }, { actualWeight: 110, actualReps: 10 })
    ).toHaveLength(2);
  });

  it('applies only selected default fields to the exercise library', async () => {
    render(<ProgressionPromptHarness />);

    fireEvent.press(screen.getByText('Open prompt'));
    fireEvent.press(screen.getByLabelText('Reps: 8 → 10'));

    await act(async () => {
      fireEvent.press(screen.getByText('Apply selected'));
    });

    expect(mockUpdateExercise).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'exercise-1',
        defaultWeight: 110,
      })
    );
    expect(mockUpdateExercise).not.toHaveBeenCalledWith(
      expect.objectContaining({
        defaultReps: 10,
      })
    );
  });

  it('skips all updates when skip all is pressed', () => {
    render(<ProgressionPromptHarness />);

    fireEvent.press(screen.getByText('Open prompt'));
    fireEvent.press(screen.getByText('Skip all'));

    expect(mockUpdateExercise).not.toHaveBeenCalled();
  });

  it('does not lower existing library defaults when applying review items', () => {
    const updates = buildDefaultUpdatesFromReviewItems(
      { defaultReps: 12, defaultWeight: 100 },
      [
        { field: 'defaultReps', plannedValue: 8, actualValue: 10 },
        { field: 'defaultWeight', plannedValue: 100, actualValue: 110 },
      ]
    );

    expect(updates).toEqual({ defaultWeight: 110 });
  });
});
