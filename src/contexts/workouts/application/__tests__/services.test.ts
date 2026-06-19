import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import { ExerciseService } from '@/src/contexts/exercises/application/exercise.service';
import type { TemplateBlockRepository } from '@/src/contexts/templateBlocks/domain/templateBlock.repository';
import { TemplateBlockService } from '@/src/contexts/templateBlocks/application/templateBlock.service';
import type { WorkoutRepository } from '@/src/contexts/workouts/domain/workout.repository';
import { WorkoutService } from '@/src/contexts/workouts/application/workout.service';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';
import { createMockExercise, createMockTemplateBlock, createMockWorkout } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';

function createExerciseRepositoryMock(
  overrides: Partial<ExerciseRepository> = {}
): ExerciseRepository {
  return {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    listActive: jest.fn(),
    listArchived: jest.fn(),
    listAll: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    setFavorite: jest.fn(),
    hardDelete: jest.fn(),
    ...overrides,
  };
}

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

function createWorkoutRepositoryMock(
  overrides: Partial<WorkoutRepository> = {}
): WorkoutRepository {
  return {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    listByWeek: jest.fn(),
    listDrafts: jest.fn(),
    listAll: jest.fn(),
    archive: jest.fn(),
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

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'exercise-1',
        name: 'Pendulum Squat',
        status: 'active',
      })
    );
    expect(exercise.id).toBe('exercise-1');
  });

  it('archives exercise', async () => {
    const repository = createExerciseRepositoryMock({
      findById: jest.fn().mockResolvedValue(createMockExercise({ id: 'exercise-1' })),
    });
    const service = new ExerciseService(repository);

    await service.archiveExercise('exercise-1');

    expect(repository.archive).toHaveBeenCalledWith('exercise-1');
  });
});

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
});

describe('WorkoutService', () => {
  it('creates draft workout', async () => {
    const workoutRepository = createWorkoutRepositoryMock();
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.createDraftWorkout({
      id: 'workout-1',
      name: 'Draft Workout',
    });

    expect(workout.status).toBe('draft');
    expect(workout.exercises).toEqual([]);
    expect(workoutRepository.create).toHaveBeenCalled();
  });

  it('creates workout from one or more template blocks', async () => {
    const exercise = createMockExercise({ id: 'exercise-1' });
    const block = createMockTemplateBlock({
      id: 'block-1',
      exerciseIds: ['exercise-1'],
    });

    const workoutRepository = createWorkoutRepositoryMock();
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock({
        findById: jest.fn().mockImplementation(async (id: string) =>
          id === 'block-1' ? block : null
        ),
      }),
      createExerciseRepositoryMock({
        findById: jest.fn().mockResolvedValue(exercise),
      })
    );

    const workout = await service.createWorkoutFromTemplateBlocks({
      id: 'workout-1',
      name: 'Wednesday Lower Body',
      date: createTestDate(),
      templateBlockIds: ['block-1'],
    });

    expect(workout.status).toBe('planned');
    expect(workout.exercises).toHaveLength(1);
    expect(workout.sourceTemplateBlockIds).toEqual(['block-1']);
    expect(workoutRepository.create).toHaveBeenCalled();
  });

  it('generates embedded WorkoutExercise[] with copied defaults and metadata', async () => {
    const exercise = createMockExercise({
      id: 'exercise-1',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glute Max'],
      defaultSets: 2,
      defaultReps: 8,
      defaultWeight: 100,
    });

    const service = new WorkoutService(
      createWorkoutRepositoryMock(),
      createTemplateBlockRepositoryMock({
        findById: jest.fn().mockResolvedValue(
          createMockTemplateBlock({ exerciseIds: ['exercise-1'] })
        ),
      }),
      createExerciseRepositoryMock({
        findById: jest.fn().mockResolvedValue(exercise),
      })
    );

    const workout = await service.createWorkoutFromTemplateBlocks({
      id: 'workout-1',
      name: 'Generated Workout',
      date: createTestDate(),
      templateBlockIds: ['block-1'],
    });

    expect(workout.exercises[0]).toMatchObject({
      id: expect.any(String),
      sortOrder: 0,
      exerciseId: 'exercise-1',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glute Max'],
      plannedSets: 2,
      plannedReps: 8,
      plannedWeight: 100,
      completed: false,
    });
  });

  it('completes workout', async () => {
    const existing = createMockWorkout({ id: 'workout-1', status: 'planned' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.completeWorkout('workout-1');

    expect(workout.status).toBe('completed');
    expect(workoutRepository.update).toHaveBeenCalled();
  });

  it('skips workout', async () => {
    const existing = createMockWorkout({ id: 'workout-1', status: 'planned' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.skipWorkout('workout-1');

    expect(workout.status).toBe('skipped');
  });

  it('archives completed or skipped workouts instead of hard deleting them', async () => {
    const completed = createMockWorkout({ id: 'workout-1', status: 'completed' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(completed),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await service.archiveWorkout('workout-1');

    expect(workoutRepository.archive).toHaveBeenCalledWith('workout-1');
    expect(workoutRepository.hardDelete).not.toHaveBeenCalled();
  });

  it('hard deletes draft workouts and rejects hard delete for completed workouts', async () => {
    const draft = createMockWorkout({ id: 'draft-1', status: 'draft', date: undefined });
    const completed = createMockWorkout({ id: 'completed-1', status: 'completed' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'draft-1') {
          return draft;
        }

        if (id === 'completed-1') {
          return completed;
        }

        return null;
      }),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await service.deleteWorkout('draft-1');
    expect(workoutRepository.hardDelete).toHaveBeenCalledWith('draft-1');

    await expect(service.deleteWorkout('completed-1')).rejects.toThrow(ServiceError);
  });
});
