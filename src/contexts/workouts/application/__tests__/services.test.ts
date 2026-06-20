import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import { ExerciseService } from '@/src/contexts/exercises/application/exercise.service';
import type { TemplateBlockRepository } from '@/src/contexts/templateBlocks/domain/templateBlock.repository';
import { TemplateBlockService } from '@/src/contexts/templateBlocks/application/templateBlock.service';
import type { WorkoutRepository } from '@/src/contexts/workouts/domain/workout.repository';
import { WorkoutService } from '@/src/contexts/workouts/application/workout.service';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';
import { createMockExercise, createMockTemplateBlock, createMockWorkout } from '@/test-utils/mockData';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';

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
    listByDateRange: jest.fn(),
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
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates draft workout with required date', async () => {
    const workoutRepository = createWorkoutRepositoryMock();
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.createWorkout({
      id: 'workout-1',
      name: 'Draft Workout',
      date: createTestDate(),
      status: 'draft',
    });

    expect(workout.status).toBe('draft');
    expect(workout.date).toEqual(createTestDate());
    expect(workout.exercises).toEqual([]);
    expect(workoutRepository.create).toHaveBeenCalled();
  });

  it('rejects workout without date', async () => {
    const service = new WorkoutService(
      createWorkoutRepositoryMock(),
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await expect(
      service.createWorkout({
        id: 'workout-1',
        name: 'Invalid',
        date: undefined as unknown as Date,
      })
    ).rejects.toThrow(ServiceError);
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
      sourceTemplateBlockId: 'block-1',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      secondaryMuscles: ['Glute Max'],
      plannedSets: 2,
      plannedReps: 8,
      plannedWeight: 100,
      completed: false,
    });
  });

  it('starts workout and sets active session', async () => {
    const existing = createMockWorkout({ id: 'workout-1', status: 'planned' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.startWorkout('workout-1');

    expect(workout.status).toBe('inProgress');
    expect(workout.activeSession).toBe(true);
    expect(workoutRepository.update).toHaveBeenCalled();
  });

  it('seeds actual values from planned values when starting a workout', async () => {
    const existing = createMockWorkout({
      id: 'workout-1',
      status: 'planned',
      exercises: [
        {
          id: 'we-1',
          sortOrder: 0,
          exerciseId: 'exercise-1',
          completed: false,
          plannedSets: 2,
          plannedReps: 10,
          plannedWeight: 50,
        },
      ],
    });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.startWorkout('workout-1');

    expect(workout.exercises[0]).toMatchObject({
      actualSets: 2,
      actualReps: 10,
      actualWeight: 50,
    });
  });

  it('resumes workout and sets active session without changing status', async () => {
    const existing = createMockWorkout({
      id: 'workout-1',
      status: 'inProgress',
      activeSession: false,
    });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.resumeWorkout('workout-1');

    expect(workout.status).toBe('inProgress');
    expect(workout.activeSession).toBe(true);
  });

  it('exits workout and clears active session while keeping inProgress status', async () => {
    const existing = createMockWorkout({
      id: 'workout-1',
      status: 'inProgress',
      activeSession: true,
    });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.exitWorkout('workout-1');

    expect(workout.status).toBe('inProgress');
    expect(workout.activeSession).toBe(false);
    expect(workoutRepository.update).toHaveBeenCalled();
  });

  it('rejects exit for non inProgress workouts', async () => {
    const existing = createMockWorkout({ id: 'workout-1', status: 'planned' });
    const service = new WorkoutService(
      createWorkoutRepositoryMock({
        findById: jest.fn().mockResolvedValue(existing),
      }),
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await expect(service.exitWorkout('workout-1')).rejects.toThrow(ServiceError);
  });

  it('updates a single workout exercise by id', async () => {
    const existing = createMockWorkout({
      id: 'workout-1',
      status: 'inProgress',
      exercises: [
        {
          id: 'we-1',
          sortOrder: 0,
          exerciseId: 'exercise-1',
          completed: false,
          plannedSets: 2,
        },
      ],
    });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const workout = await service.updateWorkoutExercise('workout-1', 'we-1', {
      completed: true,
      actualSets: 2,
      actualReps: 8,
    });

    expect(workout.exercises[0]).toMatchObject({
      id: 'we-1',
      completed: true,
      actualSets: 2,
      actualReps: 8,
    });
    expect(workoutRepository.update).toHaveBeenCalled();
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
    expect(workout.activeSession).toBe(false);
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
    expect(workout.activeSession).toBe(false);
  });

  it('hard deletes completed and skipped workouts', async () => {
    const completed = createMockWorkout({ id: 'completed-1', status: 'completed' });
    const skipped = createMockWorkout({ id: 'skipped-1', status: 'skipped' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'completed-1') {
          return completed;
        }

        if (id === 'skipped-1') {
          return skipped;
        }

        return null;
      }),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await service.deleteWorkout('completed-1');
    await service.deleteWorkout('skipped-1');

    expect(workoutRepository.hardDelete).toHaveBeenCalledWith('completed-1');
    expect(workoutRepository.hardDelete).toHaveBeenCalledWith('skipped-1');
  });

  it('clears activeSession before deleting an in-progress workout', async () => {
    const inProgress = createMockWorkout({
      id: 'workout-1',
      status: 'inProgress',
      activeSession: true,
    });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(inProgress),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await service.deleteWorkout('workout-1');

    expect(workoutRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ activeSession: false })
    );
    expect(workoutRepository.hardDelete).toHaveBeenCalledWith('workout-1');
  });

  it('hard deletes draft workouts and rejects hard delete for archived workouts', async () => {
    const draft = createMockWorkout({ id: 'draft-1', status: 'draft' });
    const archived = createMockWorkout({ id: 'archived-1', status: 'archived' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'draft-1') {
          return draft;
        }

        if (id === 'archived-1') {
          return archived;
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

    await expect(service.deleteWorkout('archived-1')).rejects.toThrow(ServiceError);
  });

  it('reverts in-progress, completed, and skipped workouts to planned with activeSession false', async () => {
    const statuses = ['inProgress', 'completed', 'skipped'] as const;

    for (const status of statuses) {
      const existing = createMockWorkout({
        id: `workout-${status}`,
        status,
        date: createTestDate(1),
        activeSession: status === 'inProgress',
      });
      const workoutRepository = createWorkoutRepositoryMock({
        findById: jest.fn().mockResolvedValue(existing),
      });
      const service = new WorkoutService(
        workoutRepository,
        createTemplateBlockRepositoryMock(),
        createExerciseRepositoryMock()
      );

      const workout = await service.revertWorkoutToPlanned(`workout-${status}`);

      expect(workout.status).toBe('planned');
      expect(workout.activeSession).toBe(false);
    }
  });

  it('rejects reverting planned and archived workouts to planned', async () => {
    const planned = createMockWorkout({ id: 'planned-1', status: 'planned' });
    const archived = createMockWorkout({ id: 'archived-1', status: 'archived' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'planned-1') {
          return planned;
        }

        if (id === 'archived-1') {
          return archived;
        }

        return null;
      }),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await expect(service.revertWorkoutToPlanned('planned-1')).rejects.toThrow(ServiceError);
    await expect(service.revertWorkoutToPlanned('archived-1')).rejects.toThrow(ServiceError);
  });

  it('rejects reverting past workouts to planned', async () => {
    const completed = createMockWorkout({
      id: 'completed-1',
      status: 'completed',
      date: createTestDate(-1),
    });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(completed),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await expect(service.revertWorkoutToPlanned('completed-1')).rejects.toThrow(ServiceError);
  });

  it('rejects creating planned workouts on past dates', async () => {
    const workoutRepository = createWorkoutRepositoryMock();
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    await expect(
      service.createWorkout({
        id: 'workout-1',
        name: 'Past Workout',
        date: createTestDate(-1),
        status: 'planned',
      })
    ).rejects.toThrow(ServiceError);
  });

  it('allows creating completed or skipped workouts on past dates', async () => {
    const workoutRepository = createWorkoutRepositoryMock();
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const completed = await service.createWorkout({
      id: 'completed-1',
      name: 'Past Completed',
      date: createTestDate(-1),
      status: 'completed',
    });
    const skipped = await service.createWorkout({
      id: 'skipped-1',
      name: 'Past Skipped',
      date: createTestDate(-2),
      status: 'skipped',
    });

    expect(completed.status).toBe('completed');
    expect(skipped.status).toBe('skipped');
    expect(workoutRepository.create).toHaveBeenCalledTimes(2);
  });

  it('allows editing completed and skipped workouts', async () => {
    const exercise = createMockExercise({ id: 'exercise-2' });

    for (const status of ['completed', 'skipped'] as const) {
      const existing = createMockWorkout({ id: `workout-${status}`, status, exercises: [] });
      const workoutRepository = createWorkoutRepositoryMock({
        findById: jest.fn().mockResolvedValue(existing),
      });
      const service = new WorkoutService(
        workoutRepository,
        createTemplateBlockRepositoryMock(),
        createExerciseRepositoryMock({
          findById: jest.fn().mockResolvedValue(exercise),
        })
      );

      const workout = await service.addExerciseToWorkout(`workout-${status}`, 'exercise-2');

      expect(workout.exercises).toHaveLength(1);
      expect(workoutRepository.update).toHaveBeenCalled();
    }
  });

  it('adds exercise to workout', async () => {
    const existing = createMockWorkout({ id: 'workout-1', exercises: [] });
    const exercise = createMockExercise({ id: 'exercise-2' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock({
        findById: jest.fn().mockResolvedValue(exercise),
      })
    );

    const workout = await service.addExerciseToWorkout('workout-1', 'exercise-2');

    expect(workout.exercises).toHaveLength(1);
    expect(workout.exercises[0]?.exerciseId).toBe('exercise-2');
    expect(workoutRepository.update).toHaveBeenCalled();
  });

  it('moves workout to another date', async () => {
    const existing = createMockWorkout({ id: 'workout-1', status: 'planned' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );
    const newDate = createTestDate(7);

    const workout = await service.moveWorkoutToDate('workout-1', newDate);

    expect(workout.date).toEqual(newDate);
  });

  it('duplicates workout on selected date', async () => {
    const existing = createMockWorkout({ id: 'workout-1', status: 'planned' });
    const workoutRepository = createWorkoutRepositoryMock({
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );
    const targetDate = createTestDate(14);

    const duplicated = await service.duplicateWorkout('workout-1', targetDate);

    expect(duplicated.id).not.toBe('workout-1');
    expect(duplicated.date).toEqual(targetDate);
    expect(duplicated.status).toBe('planned');
    expect(workoutRepository.create).toHaveBeenCalled();
  });

  it('lists workouts by date range', async () => {
    const rangeStart = createTestDate(0);
    const rangeEnd = createTestDate(30);
    const workouts = [createMockWorkout({ id: 'workout-1' })];
    const workoutRepository = createWorkoutRepositoryMock({
      listByDateRange: jest.fn().mockResolvedValue(workouts),
    });
    const service = new WorkoutService(
      workoutRepository,
      createTemplateBlockRepositoryMock(),
      createExerciseRepositoryMock()
    );

    const result = await service.listWorkoutsByDateRange(rangeStart, rangeEnd);

    expect(workoutRepository.listByDateRange).toHaveBeenCalledWith(rangeStart, rangeEnd);
    expect(result).toEqual(workouts);
  });
});
