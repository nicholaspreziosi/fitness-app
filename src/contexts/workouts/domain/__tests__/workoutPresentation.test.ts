import {
  formatWorkoutExercisePrescription,
  formatWorkoutExerciseSummaryPrescription,
  seedActualsFromPlanned,
  seedWorkoutActualsFromPlanned,
} from '@/src/contexts/workouts/domain/workoutPresentation';
import { createMockWorkoutExercise } from '@/test-utils/mockData';

describe('workoutPresentation', () => {
  it('formats planned prescription for collapsed exercise cards', () => {
    expect(
      formatWorkoutExercisePrescription({
        plannedSets: 2,
        plannedReps: 10,
        plannedWeight: 50,
        plannedHoldSeconds: 5,
      })
    ).toBe('2 x 10 • 50 lbs • 5 Sec Hold');
  });

  it('formats actual prescription for completed exercises in collapsed cards', () => {
    expect(
      formatWorkoutExerciseSummaryPrescription({
        completed: true,
        plannedSets: 2,
        plannedReps: 10,
        plannedWeight: 50,
        actualSets: 2,
        actualReps: 12,
        actualWeight: 55,
      })
    ).toBe('2 x 12 • 55 lbs');
  });

  it('uses planned values for incomplete exercises in collapsed cards', () => {
    expect(
      formatWorkoutExerciseSummaryPrescription({
        completed: false,
        plannedSets: 2,
        plannedReps: 10,
        plannedWeight: 50,
        actualSets: 2,
        actualReps: 12,
        actualWeight: 55,
      })
    ).toBe('2 x 10 • 50 lbs');
  });

  it('seeds missing actual values from planned values', () => {
    expect(
      seedActualsFromPlanned(
        createMockWorkoutExercise({
          plannedSets: 2,
          plannedReps: 10,
          plannedWeight: 50,
          plannedHoldSeconds: 5,
        })
      )
    ).toMatchObject({
      actualSets: 2,
      actualReps: 10,
      actualWeight: 50,
      actualHoldSeconds: 5,
    });
  });

  it('preserves existing actual values when seeding', () => {
    expect(
      seedActualsFromPlanned(
        createMockWorkoutExercise({
          plannedReps: 8,
          actualReps: 10,
        })
      ).actualReps
    ).toBe(10);
  });

  it('seeds all workout exercises', () => {
    const exercises = [
      createMockWorkoutExercise({ id: 'we-1', plannedReps: 8 }),
      createMockWorkoutExercise({ id: 'we-2', plannedReps: 12, actualReps: 12 }),
    ];

    expect(seedWorkoutActualsFromPlanned(exercises)).toEqual([
      expect.objectContaining({ id: 'we-1', actualReps: 8 }),
      expect.objectContaining({ id: 'we-2', actualReps: 12 }),
    ]);
  });
});
