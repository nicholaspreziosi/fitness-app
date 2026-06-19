import type { Exercise } from './exercise.model';

export interface ExerciseRepository {
  create(exercise: Exercise): Promise<void>;
  update(exercise: Exercise): Promise<void>;
  findById(id: string): Promise<Exercise | null>;
  listAll(): Promise<Exercise[]>;
  listActive(): Promise<Exercise[]>;
  listArchived(): Promise<Exercise[]>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
