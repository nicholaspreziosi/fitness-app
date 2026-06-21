import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import { TemplateBlockService } from '@/src/contexts/templateBlocks/application/templateBlock.service';
import type { TemplateBlockRepository } from '@/src/contexts/templateBlocks/domain/templateBlock.repository';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';
import { createMockExercise, createMockTemplateBlock } from '@/test-utils/mockData';

function createTemplateBlockRepositoryMock(
  overrides: Partial<TemplateBlockRepository> = {}
): TemplateBlockRepository {
  return {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    listActive: jest.fn(),
    listAll: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    setFavorite: jest.fn(),
    hardDelete: jest.fn(),
    ...overrides,
  };
}

function createExerciseRepositoryMock(
  overrides: Partial<ExerciseRepository> = {}
): ExerciseRepository {
  return {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    listAll: jest.fn(),
    listActive: jest.fn(),
    listArchived: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    setFavorite: jest.fn(),
    hardDelete: jest.fn(),
    ...overrides,
  };
}

describe('TemplateBlockService', () => {
  it('creates template block', async () => {
    const repository = createTemplateBlockRepositoryMock();
    const service = new TemplateBlockService(repository);

    const block = await service.createTemplateBlock({
      id: 'block-1',
      name: 'Quad Strength',
      status: 'active',
      exerciseIds: ['exercise-1'],
    });

    expect(repository.create).toHaveBeenCalled();
    expect(block.exerciseIds).toEqual(['exercise-1']);
  });

  it('gets template block by id', async () => {
    const existing = createMockTemplateBlock({ id: 'block-1' });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new TemplateBlockService(repository);

    const block = await service.getTemplateBlock('block-1');

    expect(block.id).toBe('block-1');
  });

  it('updates template block', async () => {
    const existing = createMockTemplateBlock({ id: 'block-1', name: 'Original' });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new TemplateBlockService(repository);

    const updated = await service.updateTemplateBlock({
      ...existing,
      name: 'Updated',
    });

    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'block-1', name: 'Updated' })
    );
    expect(updated.name).toBe('Updated');
  });

  it('throws when updating a missing template block', async () => {
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new TemplateBlockService(repository);

    await expect(
      service.updateTemplateBlock(createMockTemplateBlock({ id: 'missing' }))
    ).rejects.toBeInstanceOf(ServiceError);
  });

  it('rejects active template block with no exercises', async () => {
    const existing = createMockTemplateBlock({ id: 'block-1', status: 'draft', exerciseIds: [] });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new TemplateBlockService(repository);

    await expect(
      service.updateTemplateBlock({
        ...existing,
        status: 'active',
        exerciseIds: [],
      })
    ).rejects.toMatchObject({
      message: 'Template block data is invalid.',
      code: 'validation',
    });
  });

  it('archives template block', async () => {
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockTemplateBlock({ id: 'block-1' })),
    });
    const service = new TemplateBlockService(repository);

    await service.archiveTemplateBlock('block-1');

    expect(repository.archive).toHaveBeenCalledWith('block-1');
  });

  it('restores template block', async () => {
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(
        createMockTemplateBlock({ id: 'block-1', status: 'archived' })
      ),
    });
    const service = new TemplateBlockService(repository);

    await service.restoreTemplateBlock('block-1');

    expect(repository.restore).toHaveBeenCalledWith('block-1');
  });

  it('favorites template block', async () => {
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockTemplateBlock({ id: 'block-1' })),
    });
    const service = new TemplateBlockService(repository);

    await service.favoriteTemplateBlock('block-1');

    expect(repository.setFavorite).toHaveBeenCalledWith('block-1', true);
  });

  it('unfavorites template block', async () => {
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(
        createMockTemplateBlock({ id: 'block-1', favorite: true })
      ),
    });
    const service = new TemplateBlockService(repository);

    await service.unfavoriteTemplateBlock('block-1');

    expect(repository.setFavorite).toHaveBeenCalledWith('block-1', false);
  });

  it('adds exercise to block', async () => {
    const existing = createMockTemplateBlock({ id: 'block-1', exerciseIds: ['exercise-1'] });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) =>
        id === 'block-1' ? existing : null
      ),
    });
    const exerciseRepository = createExerciseRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) =>
        id === 'exercise-2' ? createMockExercise({ id: 'exercise-2' }) : null
      ),
    });
    const service = new TemplateBlockService(repository, exerciseRepository);

    const updated = await service.addExerciseToBlock('block-1', 'exercise-2');

    expect(updated.exerciseIds).toEqual(['exercise-1', 'exercise-2']);
    expect(repository.update).toHaveBeenCalled();
  });

  it('rejects duplicate exercise when adding to block', async () => {
    const existing = createMockTemplateBlock({ id: 'block-1', exerciseIds: ['exercise-1'] });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) =>
        id === 'block-1' ? existing : null
      ),
    });
    const exerciseRepository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockExercise({ id: 'exercise-1' })),
    });
    const service = new TemplateBlockService(repository, exerciseRepository);

    await expect(service.addExerciseToBlock('block-1', 'exercise-1')).rejects.toMatchObject({
      message: 'Exercise is already in this template block.',
      code: 'invalid_operation',
    });
  });

  it('rejects unknown exercise when adding to block', async () => {
    const existing = createMockTemplateBlock({ id: 'block-1', exerciseIds: [] });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) =>
        id === 'block-1' ? existing : null
      ),
    });
    const exerciseRepository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new TemplateBlockService(repository, exerciseRepository);

    await expect(service.addExerciseToBlock('block-1', 'missing')).rejects.toMatchObject({
      message: 'Exercise not found.',
      code: 'not_found',
    });
  });

  it('rejects template block id passed as exercise id', async () => {
    const existing = createMockTemplateBlock({ id: 'block-1', exerciseIds: [] });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'block-1') {
          return existing;
        }

        if (id === 'block-2') {
          return createMockTemplateBlock({ id: 'block-2' });
        }

        return null;
      }),
    });
    const exerciseRepository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new TemplateBlockService(repository, exerciseRepository);

    await expect(service.addExerciseToBlock('block-1', 'block-2')).rejects.toMatchObject({
      message: 'Template blocks cannot be nested inside other template blocks.',
      code: 'invalid_operation',
    });
  });

  it('removes exercise from block', async () => {
    const existing = createMockTemplateBlock({
      id: 'block-1',
      status: 'draft',
      exerciseIds: ['exercise-1', 'exercise-2'],
    });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new TemplateBlockService(repository);

    const updated = await service.removeExerciseFromBlock('block-1', 'exercise-1');

    expect(updated.exerciseIds).toEqual(['exercise-2']);
    expect(repository.update).toHaveBeenCalled();
  });

  it('reorders exercises in block', async () => {
    const existing = createMockTemplateBlock({
      id: 'block-1',
      exerciseIds: ['exercise-1', 'exercise-2', 'exercise-3'],
    });
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new TemplateBlockService(repository);

    const updated = await service.reorderExercises('block-1', [
      'exercise-3',
      'exercise-1',
      'exercise-2',
    ]);

    expect(updated.exerciseIds).toEqual(['exercise-3', 'exercise-1', 'exercise-2']);
  });

  it('hard deletes template block even when it has been used in workouts', async () => {
    const repository = createTemplateBlockRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockTemplateBlock({ id: 'block-1' })),
    });
    const service = new TemplateBlockService(repository);

    await service.deleteTemplateBlock('block-1');

    expect(repository.hardDelete).toHaveBeenCalledWith('block-1');
  });
});
