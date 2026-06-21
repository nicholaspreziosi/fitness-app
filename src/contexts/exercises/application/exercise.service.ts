import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import {
  canHardDeleteExercise,
  shouldArchiveExerciseInsteadOfDelete,
} from '@/src/contexts/exercises/domain/exercise.rules';
import { exerciseSchema } from '@/src/contexts/exercises/domain/exercise.schema';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';

export type ExerciseUsageChecker = (exerciseId: string) => Promise<boolean>;
export type UsedExerciseIdsLoader = () => Promise<ReadonlySet<string>>;

export class ExerciseService {
  constructor(
    private readonly exerciseRepository: ExerciseRepository,
    private readonly isExerciseUsed: ExerciseUsageChecker = async () => false,
    private readonly loadUsedExerciseIds: UsedExerciseIdsLoader = async () => new Set()
  ) {}

  async listExercises(): Promise<Exercise[]> {
    return this.exerciseRepository.listAll();
  }

  async getExercise(id: string): Promise<Exercise> {
    return this.requireExercise(id);
  }

  async createExercise(
    input: Omit<Exercise, 'createdAt' | 'updatedAt'> & { id: string }
  ): Promise<Exercise> {
    const now = new Date();
    const exercise: Exercise = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    this.validateExercise(exercise);
    await this.exerciseRepository.create(exercise);
    return exercise;
  }

  async updateExercise(input: Exercise): Promise<Exercise> {
    const existing = await this.exerciseRepository.findById(input.id);

    if (!existing) {
      throw new ServiceError('Exercise not found.', 'not_found');
    }

    const exercise: Exercise = {
      ...input,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.validateExercise(exercise);
    await this.exerciseRepository.update(exercise);
    return exercise;
  }

  async archiveExercise(id: string): Promise<void> {
    await this.requireExercise(id);
    await this.exerciseRepository.archive(id);
  }

  async restoreExercise(id: string): Promise<void> {
    await this.requireExercise(id);
    await this.exerciseRepository.restore(id);
  }

  async favoriteExercise(id: string): Promise<void> {
    await this.requireExercise(id);
    await this.exerciseRepository.setFavorite(id, true);
  }

  async unfavoriteExercise(id: string): Promise<void> {
    await this.requireExercise(id);
    await this.exerciseRepository.setFavorite(id, false);
  }

  async deleteExercise(id: string): Promise<void> {
    await this.requireExercise(id);

    const hasBeenUsed = await this.isExerciseUsed(id);

    if (shouldArchiveExerciseInsteadOfDelete(hasBeenUsed) || !canHardDeleteExercise(hasBeenUsed)) {
      throw new ServiceError('Archive this exercise instead of deleting it.', 'invalid_operation');
    }

    await this.exerciseRepository.hardDelete(id);
  }

  async listUsedExerciseIds(): Promise<ReadonlySet<string>> {
    return this.loadUsedExerciseIds();
  }

  private async requireExercise(id: string): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findById(id);

    if (!exercise) {
      throw new ServiceError('Exercise not found.', 'not_found');
    }

    return exercise;
  }

  private validateExercise(exercise: Exercise): void {
    const parsed = exerciseSchema.safeParse(exercise);

    if (!parsed.success) {
      throw new ServiceError('Exercise data is invalid.', 'validation');
    }
  }
}
