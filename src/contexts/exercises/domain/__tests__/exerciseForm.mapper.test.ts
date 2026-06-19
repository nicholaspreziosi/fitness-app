import { formOutputToExerciseFields, exerciseToFormValues } from '@/src/contexts/exercises/domain/exerciseForm.mapper';
import { createMockExercise } from '@/test-utils/mockData';

describe('exercise form mapper', () => {
  it('maps exercise to form values', () => {
    const exercise = createMockExercise({
      name: 'Pendulum Squat',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      defaultSets: 2,
      defaultReps: 8,
      defaultWeight: 100,
      notes: 'Slow eccentric',
    });

    expect(exerciseToFormValues(exercise)).toMatchObject({
      name: 'Pendulum Squat',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      defaultSets: '2',
      defaultReps: '8',
      defaultWeight: '100',
      notes: 'Slow eccentric',
    });
  });

  it('maps parsed form output to exercise fields', () => {
    const fields = formOutputToExerciseFields({
      name: 'Romanian Deadlift',
      status: 'active',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Hamstrings'],
      secondaryMuscles: [],
      type: ['Compound'],
      purpose: ['Strength'],
      equipment: ['Barbell'],
      defaultSets: 3,
      defaultReps: 8,
      defaultHoldSeconds: undefined,
      defaultWeight: 135,
      notes: undefined,
    });

    expect(fields).toMatchObject({
      name: 'Romanian Deadlift',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Hamstrings'],
      type: ['Compound'],
      defaultSets: 3,
      defaultWeight: 135,
    });
    expect(fields.secondaryMuscles).toBeUndefined();
  });
});
