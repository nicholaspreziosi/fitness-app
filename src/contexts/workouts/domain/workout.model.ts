import type { BodyPart, Muscle } from '@/src/contexts/exercises/domain/exercise.model';

export const WORKOUT_STATUSES = [
  'draft',
  'planned',
  'completed',
  'skipped',
  'archived',
] as const;

export type WorkoutStatus = (typeof WORKOUT_STATUSES)[number];

export interface WorkoutExercise {
  id: string;
  sortOrder: number;
  exerciseId: string;
  bodyPart?: BodyPart;
  primaryMuscles?: Muscle[];
  secondaryMuscles?: Muscle[];
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
}

export interface Workout {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  date?: Date;
  status: WorkoutStatus;
  exercises: WorkoutExercise[];
  sourceTemplateBlockIds?: string[];
  notes?: string;
}
