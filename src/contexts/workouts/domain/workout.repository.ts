import type { Workout } from '@/src/contexts/workouts/domain/workout.model';

export interface WorkoutRepository {
  create(workout: Workout): Promise<void>;
  update(workout: Workout): Promise<void>;
  findById(id: string): Promise<Workout | null>;
  listByWeek(weekStart: Date, weekEnd: Date): Promise<Workout[]>;
  listDrafts(): Promise<Workout[]>;
  listAll(): Promise<Workout[]>;
  archive(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
