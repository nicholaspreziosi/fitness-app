import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import {
  dateToTimestamp,
  stripUndefinedFields,
  timestampToDate,
} from '@/src/contexts/shared/infrastructure/firestore.mapper';
import type { Timestamp } from 'firebase/firestore';

export type FirestoreExerciseDocument = {
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: Exercise['status'];
  favorite?: boolean;
  bodyPart?: Exercise['bodyPart'];
  primaryMuscles?: Exercise['primaryMuscles'];
  secondaryMuscles?: Exercise['secondaryMuscles'];
  otherPrimaryMuscles?: string[];
  otherSecondaryMuscles?: string[];
  type?: Exercise['type'];
  purpose?: Exercise['purpose'];
  equipment?: Exercise['equipment'];
  otherEquipment?: string[];
  defaultSets?: number;
  defaultReps?: number;
  defaultHoldSeconds?: number;
  defaultWeight?: number;
  notes?: string;
};

export function exerciseToFirestore(exercise: Exercise): FirestoreExerciseDocument {
  return stripUndefinedFields({
    name: exercise.name,
    createdAt: dateToTimestamp(exercise.createdAt),
    updatedAt: dateToTimestamp(exercise.updatedAt),
    status: exercise.status,
    favorite: exercise.favorite,
    bodyPart: exercise.bodyPart,
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    otherPrimaryMuscles: exercise.otherPrimaryMuscles,
    otherSecondaryMuscles: exercise.otherSecondaryMuscles,
    type: exercise.type,
    purpose: exercise.purpose,
    equipment: exercise.equipment,
    otherEquipment: exercise.otherEquipment,
    defaultSets: exercise.defaultSets,
    defaultReps: exercise.defaultReps,
    defaultHoldSeconds: exercise.defaultHoldSeconds,
    defaultWeight: exercise.defaultWeight,
    notes: exercise.notes,
  });
}

export function exerciseFromFirestore(
  id: string,
  data: FirestoreExerciseDocument
): Exercise {
  return {
    id,
    name: data.name,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    status: data.status,
    favorite: data.favorite,
    bodyPart: data.bodyPart,
    primaryMuscles: data.primaryMuscles,
    secondaryMuscles: data.secondaryMuscles,
    otherPrimaryMuscles: data.otherPrimaryMuscles,
    otherSecondaryMuscles: data.otherSecondaryMuscles,
    type: data.type,
    purpose: data.purpose,
    equipment: data.equipment,
    otherEquipment: data.otherEquipment,
    defaultSets: data.defaultSets,
    defaultReps: data.defaultReps,
    defaultHoldSeconds: data.defaultHoldSeconds,
    defaultWeight: data.defaultWeight,
    notes: data.notes,
  };
}
