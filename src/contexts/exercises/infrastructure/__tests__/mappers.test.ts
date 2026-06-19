import { createMockExercise } from '@/test-utils/mockData';
import { createMockTemplateBlock } from '@/test-utils/mockData';
import { createMockWorkout, createMockWorkoutExercise } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { Timestamp } from 'firebase/firestore';

import {
  dateToTimestamp,
  optionalDateToTimestamp,
  optionalTimestampToDate,
  timestampToDate,
} from '@/src/contexts/shared/infrastructure/firestore.mapper';
import {
  exerciseFromFirestore,
  exerciseToFirestore,
} from '@/src/contexts/exercises/infrastructure/exercise.mapper';
import {
  templateBlockFromFirestore,
  templateBlockToFirestore,
} from '@/src/contexts/templateBlocks/infrastructure/templateBlock.mapper';
import {
  workoutFromFirestore,
  workoutToFirestore,
} from '@/src/contexts/workouts/infrastructure/workout.mapper';

describe('shared firestore mapper helpers', () => {
  it('converts Date to Firestore Timestamp and back', () => {
    const date = createTestDate();
    const timestamp = dateToTimestamp(date);

    expect(timestamp).toBeInstanceOf(Timestamp);
    expect(timestampToDate(timestamp)).toEqual(date);
  });

  it('handles optional timestamps', () => {
    const date = createTestDate();
    const timestamp = optionalDateToTimestamp(date);

    expect(optionalTimestampToDate(timestamp)).toEqual(date);
    expect(optionalTimestampToDate(undefined)).toBeUndefined();
  });
});

describe('exercise mapper', () => {
  it('preserves required fields and optional metadata', () => {
    const exercise = createMockExercise({
      favorite: true,
      type: ['Compound'],
      purpose: ['Strength'],
      equipment: ['Barbell'],
      otherEquipment: ['Sandbag'],
      otherPrimaryMuscles: ['Custom'],
      defaultHoldSeconds: 30,
      notes: 'Keep chest up',
    });

    const firestoreDoc = exerciseToFirestore(exercise);
    const restored = exerciseFromFirestore(exercise.id, firestoreDoc);

    expect(firestoreDoc.status).toBe('active');
    expect(firestoreDoc.favorite).toBe(true);
    expect(firestoreDoc.createdAt).toBeInstanceOf(Timestamp);
    expect(restored).toEqual(exercise);
  });

  it('omits undefined optional fields so Firestore setDoc accepts the payload', () => {
    const exercise = createMockExercise({
      id: 'exercise-new',
      name: 'Pendulum Squat',
      favorite: false,
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
    });

    const firestoreDoc = exerciseToFirestore(exercise);

    expect(Object.values(firestoreDoc).every((value) => value !== undefined)).toBe(true);
    expect(firestoreDoc).not.toHaveProperty('otherPrimaryMuscles');
    expect(firestoreDoc).not.toHaveProperty('otherSecondaryMuscles');
    expect(firestoreDoc).not.toHaveProperty('otherEquipment');
  });
});

describe('templateBlock mapper', () => {
  it('preserves status, favorite, and exerciseIds', () => {
    const block = createMockTemplateBlock({
      favorite: true,
      exerciseIds: ['exercise-1', 'exercise-2'],
    });

    const firestoreDoc = templateBlockToFirestore(block);
    const restored = templateBlockFromFirestore(block.id, firestoreDoc);

    expect(firestoreDoc.status).toBe('active');
    expect(firestoreDoc.favorite).toBe(true);
    expect(firestoreDoc.exerciseIds).toEqual(['exercise-1', 'exercise-2']);
    expect(restored).toEqual(block);
  });
});

describe('workout mapper', () => {
  it('preserves embedded WorkoutExercise[] with bodyPart and muscle snapshots', () => {
    const workout = createMockWorkout({
      exercises: [
        createMockWorkoutExercise({
          exerciseId: 'exercise-1',
          bodyPart: 'Upper Legs',
          primaryMuscles: ['Quads'],
          secondaryMuscles: ['Glute Max'],
          plannedSets: 2,
          plannedReps: 8,
          plannedWeight: 100,
          completed: false,
        }),
      ],
    });

    const firestoreDoc = workoutToFirestore(workout);
    const restored = workoutFromFirestore(workout.id, firestoreDoc);

    expect(firestoreDoc.exercises).toHaveLength(1);
    expect(firestoreDoc.exercises[0]).toMatchObject({
      id: 'workout-exercise-1',
      sortOrder: 0,
      exerciseId: 'exercise-1',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glute Max'],
      completed: false,
    });
    expect(restored.exercises).toEqual(workout.exercises);
  });

  it('preserves optional workout date as Timestamp', () => {
    const workout = createMockWorkout({ date: createTestDate(2) });
    const firestoreDoc = workoutToFirestore(workout);
    const restored = workoutFromFirestore(workout.id, firestoreDoc);

    expect(firestoreDoc.date).toBeInstanceOf(Timestamp);
    expect(restored.date).toEqual(workout.date);
  });
});
