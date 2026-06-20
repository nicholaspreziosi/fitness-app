import type { Workout, WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import { createId } from '@/src/lib/id/createId';
import {
  dateToTimestamp,
  optionalTimestampToDate,
  stripUndefinedFields,
  timestampToDate,
} from '@/src/contexts/shared/infrastructure/firestore.mapper';
import type { Timestamp } from 'firebase/firestore';

export type FirestoreWorkoutExerciseDocument = {
  id?: string;
  sortOrder?: number;
  exerciseId: string;
  sourceTemplateBlockId?: string | null;
  bodyPart?: WorkoutExercise['bodyPart'];
  primaryMuscles?: WorkoutExercise['primaryMuscles'];
  secondaryMuscles?: WorkoutExercise['secondaryMuscles'];
  plannedSets?: number;
  plannedReps?: number;
  plannedHoldSeconds?: number;
  plannedWeight?: number;
  actualSets?: number;
  actualReps?: number;
  actualHoldSeconds?: number;
  actualWeight?: number;
  notes?: string;
  completed: boolean;
};

export type FirestoreWorkoutDocument = {
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  date: Timestamp;
  status: Workout['status'];
  activeSession?: boolean;
  exercises: FirestoreWorkoutExerciseDocument[];
  sourceTemplateBlockIds?: string[];
  notes?: string;
};

function workoutExerciseToFirestore(
  exercise: WorkoutExercise
): FirestoreWorkoutExerciseDocument {
  return stripUndefinedFields({
    id: exercise.id,
    sortOrder: exercise.sortOrder,
    exerciseId: exercise.exerciseId,
    sourceTemplateBlockId: exercise.sourceTemplateBlockId ?? null,
    bodyPart: exercise.bodyPart,
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    plannedSets: exercise.plannedSets,
    plannedReps: exercise.plannedReps,
    plannedHoldSeconds: exercise.plannedHoldSeconds,
    plannedWeight: exercise.plannedWeight,
    actualSets: exercise.actualSets,
    actualReps: exercise.actualReps,
    actualHoldSeconds: exercise.actualHoldSeconds,
    actualWeight: exercise.actualWeight,
    notes: exercise.notes,
    completed: exercise.completed,
  });
}

function workoutExerciseFromFirestore(
  data: FirestoreWorkoutExerciseDocument,
  index: number
): WorkoutExercise {
  return {
    id: data.id ?? createId('workout-exercise'),
    sortOrder: data.sortOrder ?? index,
    exerciseId: data.exerciseId,
    sourceTemplateBlockId: data.sourceTemplateBlockId ?? null,
    bodyPart: data.bodyPart,
    primaryMuscles: data.primaryMuscles,
    secondaryMuscles: data.secondaryMuscles,
    plannedSets: data.plannedSets,
    plannedReps: data.plannedReps,
    plannedHoldSeconds: data.plannedHoldSeconds,
    plannedWeight: data.plannedWeight,
    actualSets: data.actualSets,
    actualReps: data.actualReps,
    actualHoldSeconds: data.actualHoldSeconds,
    actualWeight: data.actualWeight,
    notes: data.notes,
    completed: data.completed,
  };
}

export function workoutToFirestore(workout: Workout): FirestoreWorkoutDocument {
  return stripUndefinedFields({
    name: workout.name,
    createdAt: dateToTimestamp(workout.createdAt),
    updatedAt: dateToTimestamp(workout.updatedAt),
    date: dateToTimestamp(workout.date),
    status: workout.status,
    activeSession: workout.activeSession,
    exercises: workout.exercises.map(workoutExerciseToFirestore),
    sourceTemplateBlockIds: workout.sourceTemplateBlockIds,
    notes: workout.notes,
  });
}

export function workoutFromFirestore(id: string, data: FirestoreWorkoutDocument): Workout {
  return {
    id,
    name: data.name,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    date: data.date ? timestampToDate(data.date) : timestampToDate(data.createdAt),
    status: data.status,
    activeSession: data.activeSession ?? false,
    exercises: data.exercises.map((exercise, index) => workoutExerciseFromFirestore(exercise, index)),
    sourceTemplateBlockIds: data.sourceTemplateBlockIds,
    notes: data.notes,
  };
}
