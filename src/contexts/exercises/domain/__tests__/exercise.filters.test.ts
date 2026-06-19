import { filterExercises } from '@/src/contexts/exercises/domain/exercise.filters';
import { createMockExercise } from '@/test-utils/mockData';

describe('filterExercises', () => {
  const exercises = [
    createMockExercise({ id: '1', name: 'Pendulum Squat', status: 'active', favorite: true }),
    createMockExercise({
      id: '2',
      name: 'Romanian Deadlift',
      status: 'active',
      favorite: false,
    }),
    createMockExercise({ id: '3', name: 'Wall Sit', status: 'archived', favorite: false }),
  ];

  it('filters exercises by search text', () => {
    expect(filterExercises(exercises, { search: 'deadlift' })).toHaveLength(1);
    expect(filterExercises(exercises, { search: 'deadlift' })[0]?.name).toBe(
      'Romanian Deadlift'
    );
  });

  it('filters exercises by status', () => {
    expect(filterExercises(exercises, { status: 'archived' })).toHaveLength(1);
    expect(filterExercises(exercises, { status: 'active' })).toHaveLength(2);
  });

  it('filters exercises by favorites only', () => {
    expect(filterExercises(exercises, { favoritesOnly: true })).toHaveLength(1);
    expect(filterExercises(exercises, { favoritesOnly: true })[0]?.name).toBe('Pendulum Squat');
  });

  it('filters exercises by body part', () => {
    const withBodyParts = [
      createMockExercise({ id: '1', bodyPart: 'Upper Legs' }),
      createMockExercise({ id: '2', bodyPart: 'Core' }),
    ];

    expect(filterExercises(withBodyParts, { bodyParts: ['Core'] })).toHaveLength(1);
    expect(filterExercises(withBodyParts, { bodyParts: ['Core'] })[0]?.bodyPart).toBe('Core');
  });

  it('filters exercises by muscle', () => {
    const withMuscles = [
      createMockExercise({ id: '1', primaryMuscles: ['Quads'] }),
      createMockExercise({ id: '2', primaryMuscles: ['Hamstrings'] }),
    ];

    expect(filterExercises(withMuscles, { muscles: ['Hamstrings'] })).toHaveLength(1);
  });

  it('filters exercises by type, purpose, and equipment', () => {
    const classified = [
      createMockExercise({
        id: '1',
        type: ['Compound'],
        purpose: ['Strength'],
        equipment: ['Barbell'],
      }),
      createMockExercise({
        id: '2',
        type: ['Mobility'],
        purpose: ['Mobility'],
        equipment: ['Bodyweight'],
      }),
    ];

    expect(filterExercises(classified, { types: ['Compound'] })).toHaveLength(1);
    expect(filterExercises(classified, { purposes: ['Mobility'] })).toHaveLength(1);
    expect(filterExercises(classified, { equipment: ['Barbell'] })).toHaveLength(1);
  });
});
