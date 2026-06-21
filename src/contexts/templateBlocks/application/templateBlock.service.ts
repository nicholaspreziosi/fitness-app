import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import type { TemplateBlockRepository } from '@/src/contexts/templateBlocks/domain/templateBlock.repository';
import { templateBlockSchema } from '@/src/contexts/templateBlocks/domain/templateBlock.schema';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';

export class TemplateBlockService {
  constructor(
    private readonly templateBlockRepository: TemplateBlockRepository,
    private readonly exerciseRepository?: ExerciseRepository
  ) {}

  async listTemplateBlocks(): Promise<TemplateBlock[]> {
    return this.templateBlockRepository.listAll();
  }

  async getTemplateBlock(id: string): Promise<TemplateBlock> {
    return this.requireTemplateBlock(id);
  }

  async createTemplateBlock(
    input: Omit<TemplateBlock, 'createdAt' | 'updatedAt'> & { id: string }
  ): Promise<TemplateBlock> {
    const now = new Date();
    const block: TemplateBlock = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    this.validateTemplateBlock(block);
    await this.templateBlockRepository.create(block);
    return block;
  }

  async updateTemplateBlock(input: TemplateBlock): Promise<TemplateBlock> {
    const existing = await this.templateBlockRepository.findById(input.id);

    if (!existing) {
      throw new ServiceError('Template block not found.', 'not_found');
    }

    const block: TemplateBlock = {
      ...input,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.validateTemplateBlock(block);
    await this.templateBlockRepository.update(block);
    return block;
  }

  async addExerciseToBlock(blockId: string, exerciseId: string): Promise<TemplateBlock> {
    const block = await this.requireTemplateBlock(blockId);

    await this.requireSelectableExerciseId(exerciseId);

    if (block.exerciseIds.includes(exerciseId)) {
      throw new ServiceError('Exercise is already in this template block.', 'invalid_operation');
    }

    return this.updateTemplateBlock({
      ...block,
      exerciseIds: [...block.exerciseIds, exerciseId],
    });
  }

  async removeExerciseFromBlock(blockId: string, exerciseId: string): Promise<TemplateBlock> {
    const block = await this.requireTemplateBlock(blockId);

    return this.updateTemplateBlock({
      ...block,
      exerciseIds: block.exerciseIds.filter((id) => id !== exerciseId),
    });
  }

  async reorderExercises(blockId: string, exerciseIds: string[]): Promise<TemplateBlock> {
    const block = await this.requireTemplateBlock(blockId);

    const existingIds = new Set(block.exerciseIds);

    if (
      exerciseIds.length !== block.exerciseIds.length ||
      exerciseIds.some((id) => !existingIds.has(id))
    ) {
      throw new ServiceError('Exercise order must include the same exercises.', 'invalid_operation');
    }

    return this.updateTemplateBlock({
      ...block,
      exerciseIds,
    });
  }

  async archiveTemplateBlock(id: string): Promise<void> {
    await this.requireTemplateBlock(id);
    await this.templateBlockRepository.archive(id);
  }

  async restoreTemplateBlock(id: string): Promise<void> {
    await this.requireTemplateBlock(id);
    await this.templateBlockRepository.restore(id);
  }

  async favoriteTemplateBlock(id: string): Promise<void> {
    await this.requireTemplateBlock(id);
    await this.templateBlockRepository.setFavorite(id, true);
  }

  async unfavoriteTemplateBlock(id: string): Promise<void> {
    await this.requireTemplateBlock(id);
    await this.templateBlockRepository.setFavorite(id, false);
  }

  async deleteTemplateBlock(id: string): Promise<void> {
    await this.requireTemplateBlock(id);
    await this.templateBlockRepository.hardDelete(id);
  }

  private async requireSelectableExerciseId(exerciseId: string): Promise<void> {
    const templateBlock = await this.templateBlockRepository.findById(exerciseId);

    if (templateBlock) {
      throw new ServiceError(
        'Template blocks cannot be nested inside other template blocks.',
        'invalid_operation'
      );
    }

    if (!this.exerciseRepository) {
      return;
    }

    const exercise = await this.exerciseRepository.findById(exerciseId);

    if (!exercise) {
      throw new ServiceError('Exercise not found.', 'not_found');
    }
  }

  private async requireTemplateBlock(id: string): Promise<TemplateBlock> {
    const block = await this.templateBlockRepository.findById(id);

    if (!block) {
      throw new ServiceError('Template block not found.', 'not_found');
    }

    return block;
  }

  private validateTemplateBlock(block: TemplateBlock): void {
    const parsed = templateBlockSchema.safeParse(block);

    if (!parsed.success) {
      throw new ServiceError('Template block data is invalid.', 'validation');
    }
  }
}
