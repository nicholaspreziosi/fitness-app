import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import { ExerciseService } from '@/src/contexts/exercises/application/exercise.service';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';
import { createMockExercise } from '@/test-utils/mockData';

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

describe('ExerciseService', () => {
  it('creates exercise', async () => {
    const repository = createExerciseRepositoryMock();
    const service = new ExerciseService(repository);

    const exercise = await service.createExercise({
      id: 'exercise-1',
      name: 'Pendulum Squat',
      status: 'active',
    });

    expect(repository.create).toHaveBeenCalled();
    expect(exercise.name).toBe('Pendulum Squat');
  });

  it('edits exercise', async () => {
    const existing = createMockExercise({ id: 'exercise-1', name: 'Original' });
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new ExerciseService(repository);

    const updated = await service.updateExercise({
      ...existing,
      name: 'Updated',
    });

    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'exercise-1', name: 'Updated' })
    );
    expect(updated.name).toBe('Updated');
  });

  it('archives exercise', async () => {
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockExercise({ id: 'exercise-1' })),
    });
    const service = new ExerciseService(repository);

    await service.archiveExercise('exercise-1');

    expect(repository.archive).toHaveBeenCalledWith('exercise-1');
  });

  it('restores exercise', async () => {
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(
        createMockExercise({ id: 'exercise-1', status: 'archived' })
      ),
    });
    const service = new ExerciseService(repository);

    await service.restoreExercise('exercise-1');

    expect(repository.restore).toHaveBeenCalledWith('exercise-1');
  });

  it('favorites exercise', async () => {
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockExercise({ id: 'exercise-1' })),
    });
    const service = new ExerciseService(repository);

    await service.favoriteExercise('exercise-1');

    expect(repository.setFavorite).toHaveBeenCalledWith('exercise-1', true);
  });

  it('unfavorites exercise', async () => {
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(
        createMockExercise({ id: 'exercise-1', favorite: true })
      ),
    });
    const service = new ExerciseService(repository);

    await service.unfavoriteExercise('exercise-1');

    expect(repository.setFavorite).toHaveBeenCalledWith('exercise-1', false);
  });

  it('prevents unsafe hard delete if exercise has been used', async () => {
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockExercise({ id: 'exercise-1' })),
    });
    const service = new ExerciseService(repository, async () => true);

    await expect(service.deleteExercise('exercise-1')).rejects.toMatchObject({
      message: 'Archive this exercise instead of deleting it.',
      code: 'invalid_operation',
    });
    expect(repository.hardDelete).not.toHaveBeenCalled();
  });

  it('hard deletes exercise when it has never been used', async () => {
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockExercise({ id: 'exercise-1' })),
    });
    const service = new ExerciseService(repository, async () => false);

    await service.deleteExercise('exercise-1');

    expect(repository.hardDelete).toHaveBeenCalledWith('exercise-1');
  });

  it('gets exercise by id', async () => {
    const existing = createMockExercise({ id: 'exercise-1' });
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new ExerciseService(repository);

    const exercise = await service.getExercise('exercise-1');

    expect(exercise.id).toBe('exercise-1');
  });

  it('throws when editing a missing exercise', async () => {
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = new ExerciseService(repository);

    await expect(
      service.updateExercise(createMockExercise({ id: 'missing' }))
    ).rejects.toBeInstanceOf(ServiceError);
  });
});
