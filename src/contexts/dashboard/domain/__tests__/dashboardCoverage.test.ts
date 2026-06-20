import { aggregateBodyPartCoverage } from '@/src/contexts/dashboard/domain/dashboardCoverage';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';

describe('aggregateBodyPartCoverage', () => {
  it('aggregates completed WorkoutExercises by bodyPart', () => {
    const workouts = [
      createMockWorkout({
        status: 'completed',
        exercises: [
          createMockWorkoutExercise({ bodyPart: 'Upper Legs', completed: true }),
          createMockWorkoutExercise({
            id: 'we-2',
            bodyPart: 'Upper Legs',
            completed: true,
          }),
          createMockWorkoutExercise({
            id: 'we-3',
            bodyPart: 'Shoulders',
            completed: true,
          }),
        ],
      }),
    ];

    expect(aggregateBodyPartCoverage(workouts)).toEqual([
      { bodyPart: 'Upper Legs', count: 2 },
      { bodyPart: 'Shoulders', count: 1 },
    ]);
  });

  it('ignores incomplete WorkoutExercises', () => {
    const workouts = [
      createMockWorkout({
        status: 'completed',
        exercises: [
          createMockWorkoutExercise({ bodyPart: 'Core', completed: true }),
          createMockWorkoutExercise({ id: 'we-2', bodyPart: 'Core', completed: false }),
        ],
      }),
    ];

    expect(aggregateBodyPartCoverage(workouts)).toEqual([{ bodyPart: 'Core', count: 1 }]);
  });

  it('ignores non-completed workouts', () => {
    const workouts = [
      createMockWorkout({
        status: 'planned',
        exercises: [createMockWorkoutExercise({ bodyPart: 'Core', completed: true })],
      }),
      createMockWorkout({
        id: 'workout-2',
        status: 'inProgress',
        exercises: [
          createMockWorkoutExercise({ id: 'we-2', bodyPart: 'Shoulders', completed: true }),
        ],
      }),
    ];

    expect(aggregateBodyPartCoverage(workouts)).toEqual([]);
  });

  it('ignores archived workouts', () => {
    const workouts = [
      createMockWorkout({
        status: 'archived',
        exercises: [createMockWorkoutExercise({ bodyPart: 'Feet', completed: true })],
      }),
    ];

    expect(aggregateBodyPartCoverage(workouts)).toEqual([]);
  });

  it('sorts body parts by count descending', () => {
    const workouts = [
      createMockWorkout({
        status: 'completed',
        exercises: [
          createMockWorkoutExercise({ bodyPart: 'Core', completed: true }),
          createMockWorkoutExercise({ id: 'we-2', bodyPart: 'Quads', completed: true }),
          createMockWorkoutExercise({ id: 'we-3', bodyPart: 'Quads', completed: true }),
          createMockWorkoutExercise({ id: 'we-4', bodyPart: 'Quads', completed: true }),
        ],
      }),
    ];

    expect(aggregateBodyPartCoverage(workouts).map((item) => item.bodyPart)).toEqual([
      'Quads',
      'Core',
    ]);
  });

  it('returns empty state when no completed exercises exist', () => {
    expect(aggregateBodyPartCoverage([])).toEqual([]);
  });

  it('buckets missing bodyPart as Unknown', () => {
    const workouts = [
      createMockWorkout({
        status: 'completed',
        exercises: [createMockWorkoutExercise({ bodyPart: undefined, completed: true })],
      }),
    ];

    expect(aggregateBodyPartCoverage(workouts)).toEqual([{ bodyPart: 'Unknown', count: 1 }]);
  });
});
