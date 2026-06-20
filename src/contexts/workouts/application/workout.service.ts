import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import type { TemplateBlockRepository } from '@/src/contexts/templateBlocks/domain/templateBlock.repository';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';
import {
  canAddExerciseToWorkout,
  canAddTemplateBlockToWorkout,
  canEditWorkoutExercises,
  canMoveExerciseBetweenWorkouts,
  canMoveWorkoutToDate,
  canReorderWorkoutExercises,
} from '@/src/contexts/workouts/domain/planner.rules';
import {
  duplicateWorkout as duplicateWorkoutHelper,
  generateWorkoutExerciseFromExercise,
  generateWorkoutExercisesFromTemplateBlock,
  generateWorkoutExercisesFromTemplateBlocks,
  getNextSortOrder,
  moveWorkoutExerciseToWorkout,
  removeWorkoutExercise,
  reorderWorkoutExercises,
} from '@/src/contexts/workouts/domain/planner.helpers';
import type { Workout, WorkoutExercise } from '@/src/contexts/workouts/domain/workout.model';
import type { WorkoutRepository } from '@/src/contexts/workouts/domain/workout.repository';
import {
  canHardDeleteWorkout,
  canRevertWorkoutToPlanned,
  canUsePlannedStatusForWorkout,
  isPastWorkoutDate,
} from '@/src/contexts/workouts/domain/workout.rules';
import { workoutSchema } from '@/src/contexts/workouts/domain/workout.schema';
import { seedWorkoutActualsFromPlanned } from '@/src/contexts/workouts/domain/workoutPresentation';
import { createId } from '@/src/lib/id/createId';

export class WorkoutService {
  constructor(
    private readonly workoutRepository: WorkoutRepository,
    private readonly templateBlockRepository: TemplateBlockRepository,
    private readonly exerciseRepository: ExerciseRepository
  ) {}

  async createWorkout(params: {
    id: string;
    name: string;
    date: Date;
    status?: Extract<Workout['status'], 'draft' | 'planned' | 'completed' | 'skipped'>;
    templateBlockIds?: string[];
    exerciseIds?: string[];
  }): Promise<Workout> {
    if (!params.date) {
      throw new ServiceError('Workout date is required.', 'validation');
    }

    const templateBlockIds = params.templateBlockIds ?? [];
    const exerciseIds = params.exerciseIds ?? [];
    const blocks =
      templateBlockIds.length > 0
        ? (
            await Promise.all(
              templateBlockIds.map((id) => this.templateBlockRepository.findById(id))
            )
          ).filter((block) => block !== null)
        : [];

    if (templateBlockIds.length > 0 && blocks.length !== templateBlockIds.length) {
      throw new ServiceError('One or more template blocks were not found.', 'not_found');
    }

    const exerciseMap = new Map<string, Awaited<ReturnType<ExerciseRepository['findById']>>>();
    const allExerciseIds = [
      ...blocks.flatMap((block) => block.exerciseIds),
      ...exerciseIds,
    ];

    for (const exerciseId of allExerciseIds) {
      if (!exerciseMap.has(exerciseId)) {
        exerciseMap.set(exerciseId, await this.exerciseRepository.findById(exerciseId));
      }
    }

    let workoutExercises = generateWorkoutExercisesFromTemplateBlocks(
      blocks,
      exerciseMap as Map<string, NonNullable<Awaited<ReturnType<ExerciseRepository['findById']>>>>,
      0
    );

    let sortOrder = getNextSortOrder(workoutExercises);

    for (const exerciseId of exerciseIds) {
      const exercise = exerciseMap.get(exerciseId);

      if (!exercise) {
        throw new ServiceError('One or more exercises were not found.', 'not_found');
      }

      const workoutExercise = generateWorkoutExerciseFromExercise(exercise, sortOrder);

      if (workoutExercise) {
        workoutExercises.push(workoutExercise);
        sortOrder += 1;
      }
    }

    const now = new Date();
    const status = params.status ?? 'planned';
    const plannedRule = canUsePlannedStatusForWorkout({ date: params.date, status }, now);

    if (!plannedRule.allowed) {
      throw new ServiceError(plannedRule.message, 'invalid_operation');
    }

    const workout: Workout = {
      id: params.id,
      name: params.name,
      createdAt: now,
      updatedAt: now,
      date: params.date,
      status,
      exercises: workoutExercises,
      sourceTemplateBlockIds: templateBlockIds.length > 0 ? templateBlockIds : undefined,
    };

    return this.saveWorkout(workout);
  }

  async createWorkoutFromTemplateBlocks(params: {
    id: string;
    name: string;
    date: Date;
    templateBlockIds: string[];
  }): Promise<Workout> {
    if (!params.date) {
      throw new ServiceError('Workout date is required.', 'validation');
    }

    return this.createWorkout({
      id: params.id,
      name: params.name,
      date: params.date,
      status: 'planned',
      templateBlockIds: params.templateBlockIds,
    });
  }

  async addTemplateBlockToWorkout(workoutId: string, templateBlockId: string): Promise<Workout> {
    const workout = await this.requireWorkout(workoutId);
    const block = await this.templateBlockRepository.findById(templateBlockId);

    if (!block) {
      throw new ServiceError('Template block not found.', 'not_found');
    }

    const rule = canAddTemplateBlockToWorkout(workout, block.exerciseIds);

    if (!rule.allowed) {
      throw new ServiceError(rule.message, 'invalid_operation');
    }

    const exerciseMap = new Map<string, NonNullable<Awaited<ReturnType<ExerciseRepository['findById']>>>>();

    for (const exerciseId of block.exerciseIds) {
      const exercise = await this.exerciseRepository.findById(exerciseId);

      if (exercise) {
        exerciseMap.set(exerciseId, exercise);
      }
    }

    const appended = generateWorkoutExercisesFromTemplateBlock(
      block,
      exerciseMap,
      getNextSortOrder(workout.exercises)
    );

    if (appended.length === 0) {
      throw new ServiceError('No exercises found for the selected template block.', 'not_found');
    }

    const updated: Workout = {
      ...workout,
      exercises: [...workout.exercises, ...appended],
      sourceTemplateBlockIds: [...(workout.sourceTemplateBlockIds ?? []), templateBlockId],
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async addExerciseToWorkout(workoutId: string, exerciseId: string): Promise<Workout> {
    const workout = await this.requireWorkout(workoutId);
    const rule = canAddExerciseToWorkout(workout, exerciseId);

    if (!rule.allowed) {
      throw new ServiceError(rule.message, 'invalid_operation');
    }

    const exercise = await this.exerciseRepository.findById(exerciseId);

    if (!exercise) {
      throw new ServiceError('Exercise not found.', 'not_found');
    }

    const workoutExercise = generateWorkoutExerciseFromExercise(
      exercise,
      getNextSortOrder(workout.exercises)
    );

    if (!workoutExercise) {
      throw new ServiceError('Exercise cannot be added to the workout.', 'invalid_operation');
    }

    const updated: Workout = {
      ...workout,
      exercises: [...workout.exercises, workoutExercise],
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async removeExerciseFromWorkout(
    workoutId: string,
    workoutExerciseId: string
  ): Promise<Workout> {
    const workout = await this.requireWorkout(workoutId);
    const rule = canReorderWorkoutExercises(workout);

    if (!rule.allowed) {
      throw new ServiceError(rule.message, 'invalid_operation');
    }

    const updated: Workout = {
      ...workout,
      exercises: removeWorkoutExercise(workout.exercises, workoutExerciseId),
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async reorderWorkoutExercises(workoutId: string, orderedIds: string[]): Promise<Workout> {
    const workout = await this.requireWorkout(workoutId);
    const rule = canReorderWorkoutExercises(workout);

    if (!rule.allowed) {
      throw new ServiceError(rule.message, 'invalid_operation');
    }

    const updated: Workout = {
      ...workout,
      exercises: reorderWorkoutExercises(workout.exercises, orderedIds),
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async moveExerciseToWorkout(
    sourceWorkoutId: string,
    workoutExerciseId: string,
    targetWorkoutId: string
  ): Promise<{ sourceWorkout: Workout; targetWorkout: Workout }> {
    const source = await this.requireWorkout(sourceWorkoutId);
    const target = await this.requireWorkout(targetWorkoutId);
    const exercise = source.exercises.find((item) => item.id === workoutExerciseId);

    if (!exercise) {
      throw new ServiceError('Workout exercise not found.', 'not_found');
    }

    const rule = canMoveExerciseBetweenWorkouts(source, target, exercise.exerciseId);

    if (!rule.allowed) {
      throw new ServiceError(rule.message, 'invalid_operation');
    }

    const { sourceWorkout, targetWorkout } = moveWorkoutExerciseToWorkout({
      source,
      target,
      workoutExerciseId,
    });

    const now = new Date();
    const updatedSource = await this.saveWorkout({ ...sourceWorkout, updatedAt: now });
    const updatedTarget = await this.saveWorkout({ ...targetWorkout, updatedAt: now });

    return { sourceWorkout: updatedSource, targetWorkout: updatedTarget };
  }

  async moveWorkoutToDate(
    workoutId: string,
    date: Date,
    options: { confirmed?: boolean } = {}
  ): Promise<Workout> {
    const workout = await this.requireWorkout(workoutId);
    const rule = canMoveWorkoutToDate(workout);

    if (!rule.allowed) {
      throw new ServiceError(rule.message, 'invalid_operation');
    }

    if (rule.requiresConfirmation && !options.confirmed) {
      throw new ServiceError('Confirmation is required to move an in-progress workout.', 'invalid_operation');
    }

    const updated: Workout = {
      ...workout,
      date,
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async duplicateWorkout(workoutId: string, targetDate: Date): Promise<Workout> {
    const workout = await this.requireWorkout(workoutId);
    const newExerciseIds = workout.exercises.map(() => createId('workout-exercise'));
    const duplicated = duplicateWorkoutHelper(workout, {
      newWorkoutId: createId('workout'),
      newExerciseIds,
      targetDate,
    });

    const resolvedStatus = isPastWorkoutDate(targetDate)
      ? workout.status === 'completed' || workout.status === 'skipped'
        ? workout.status
        : 'completed'
      : 'planned';

    const normalized: Workout = {
      ...duplicated,
      status: resolvedStatus,
      activeSession: false,
    };

    await this.workoutRepository.create(normalized);
    return normalized;
  }

  async updateWorkout(workout: Workout): Promise<Workout> {
    return this.saveWorkout({ ...workout, updatedAt: new Date() });
  }

  async updateWorkoutExercise(
    workoutId: string,
    workoutExerciseId: string,
    patch: Partial<
      Pick<
        WorkoutExercise,
        | 'completed'
        | 'actualSets'
        | 'actualReps'
        | 'actualHoldSeconds'
        | 'actualWeight'
        | 'notes'
      >
    >
  ): Promise<Workout> {
    const workout = await this.requireWorkout(workoutId);
    const rule = canEditWorkoutExercises(workout.status);

    if (!rule.allowed) {
      throw new ServiceError(rule.message, 'invalid_operation');
    }

    const exerciseIndex = workout.exercises.findIndex(
      (exercise) => exercise.id === workoutExerciseId
    );

    if (exerciseIndex === -1) {
      throw new ServiceError('Workout exercise not found.', 'not_found');
    }

    const updated: Workout = {
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === workoutExerciseId ? { ...exercise, ...patch } : exercise
      ),
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async startWorkout(id: string): Promise<Workout> {
    const workout = await this.requireWorkout(id);

    const updated: Workout = {
      ...workout,
      status: 'inProgress',
      activeSession: true,
      exercises: seedWorkoutActualsFromPlanned(workout.exercises),
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async resumeWorkout(id: string): Promise<Workout> {
    const workout = await this.requireWorkout(id);

    if (workout.status !== 'inProgress') {
      throw new ServiceError('Workout is not in progress.', 'invalid_operation');
    }

    const updated: Workout = {
      ...workout,
      activeSession: true,
      exercises: seedWorkoutActualsFromPlanned(workout.exercises),
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async exitWorkout(id: string): Promise<Workout> {
    const workout = await this.requireWorkout(id);

    if (workout.status !== 'inProgress') {
      throw new ServiceError('Workout is not in progress.', 'invalid_operation');
    }

    const updated: Workout = {
      ...workout,
      activeSession: false,
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async completeWorkout(id: string): Promise<Workout> {
    const workout = await this.requireWorkout(id);

    const updated: Workout = {
      ...workout,
      status: 'completed',
      activeSession: false,
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async skipWorkout(id: string): Promise<Workout> {
    const workout = await this.requireWorkout(id);

    const updated: Workout = {
      ...workout,
      status: 'skipped',
      activeSession: false,
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async revertWorkoutToPlanned(id: string): Promise<Workout> {
    const workout = await this.requireWorkout(id);
    const rule = canRevertWorkoutToPlanned(workout);

    if (!rule.allowed) {
      throw new ServiceError(rule.message, 'invalid_operation');
    }

    const updated: Workout = {
      ...workout,
      status: 'planned',
      activeSession: false,
      updatedAt: new Date(),
    };

    return this.saveWorkout(updated);
  }

  async deleteWorkout(id: string): Promise<void> {
    const workout = await this.requireWorkout(id);

    if (!canHardDeleteWorkout(workout.status)) {
      throw new ServiceError('This workout cannot be deleted.', 'invalid_operation');
    }

    if (workout.status === 'inProgress' && workout.activeSession) {
      await this.saveWorkout({
        ...workout,
        activeSession: false,
        updatedAt: new Date(),
      });
    }

    await this.workoutRepository.hardDelete(id);
  }

  async listWorkoutsByWeek(weekStart: Date, weekEnd: Date): Promise<Workout[]> {
    return this.workoutRepository.listByWeek(weekStart, weekEnd);
  }

  async listWorkoutsByDateRange(rangeStart: Date, rangeEnd: Date): Promise<Workout[]> {
    return this.workoutRepository.listByDateRange(rangeStart, rangeEnd);
  }

  async getWorkout(id: string): Promise<Workout | null> {
    return this.workoutRepository.findById(id);
  }

  private async requireWorkout(id: string): Promise<Workout> {
    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new ServiceError('Workout not found.', 'not_found');
    }

    return workout;
  }

  private async saveWorkout(workout: Workout): Promise<Workout> {
    const plannedRule = canUsePlannedStatusForWorkout(workout);

    if (!plannedRule.allowed) {
      throw new ServiceError(plannedRule.message, 'invalid_operation');
    }

    const parsed = workoutSchema.safeParse(workout);

    if (!parsed.success) {
      throw new ServiceError('Workout data is invalid.', 'validation');
    }

    const existing = await this.workoutRepository.findById(workout.id);

    if (existing) {
      await this.workoutRepository.update(workout);
    } else {
      await this.workoutRepository.create(workout);
    }

    return workout;
  }
}
