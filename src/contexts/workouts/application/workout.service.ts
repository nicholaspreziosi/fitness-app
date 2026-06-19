import type { ExerciseRepository } from '@/src/contexts/exercises/domain/exercise.repository';
import type { TemplateBlockRepository } from '@/src/contexts/templateBlocks/domain/templateBlock.repository';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import type { WorkoutRepository } from '@/src/contexts/workouts/domain/workout.repository';
import {
  canHardDeleteWorkout,
  shouldArchiveWorkoutInsteadOfDelete,
} from '@/src/contexts/workouts/domain/workout.rules';
import { workoutSchema } from '@/src/contexts/workouts/domain/workout.schema';
import { generateWorkoutExercisesFromExercises } from '@/src/contexts/workouts/domain/workoutGeneration';

export class WorkoutService {
  constructor(
    private readonly workoutRepository: WorkoutRepository,
    private readonly templateBlockRepository: TemplateBlockRepository,
    private readonly exerciseRepository: ExerciseRepository
  ) {}

  async createDraftWorkout(params: { id: string; name: string }): Promise<Workout> {
    const now = new Date();
    const workout: Workout = {
      id: params.id,
      name: params.name,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      exercises: [],
    };

    const parsed = workoutSchema.safeParse(workout);

    if (!parsed.success) {
      throw new ServiceError('Workout data is invalid.', 'validation');
    }

    await this.workoutRepository.create(workout);
    return workout;
  }

  async createWorkoutFromTemplateBlocks(params: {
    id: string;
    name: string;
    date?: Date;
    templateBlockIds: string[];
  }): Promise<Workout> {
    if (params.templateBlockIds.length === 0) {
      throw new ServiceError('Select at least one template block.', 'invalid_operation');
    }

    const blocks = await Promise.all(
      params.templateBlockIds.map((id) => this.templateBlockRepository.findById(id))
    );

    if (blocks.some((block) => block === null)) {
      throw new ServiceError('One or more template blocks were not found.', 'not_found');
    }

    const exerciseIds = [...new Set(blocks.flatMap((block) => block!.exerciseIds))];
    const exercises = (
      await Promise.all(exerciseIds.map((id) => this.exerciseRepository.findById(id)))
    ).filter((exercise) => exercise !== null);

    if (exercises.length === 0) {
      throw new ServiceError('No exercises found for the selected template blocks.', 'not_found');
    }

    const workoutExercises = generateWorkoutExercisesFromExercises(exercises);
    const now = new Date();
    const workout: Workout = {
      id: params.id,
      name: params.name,
      createdAt: now,
      updatedAt: now,
      date: params.date,
      status: params.date ? 'planned' : 'draft',
      exercises: workoutExercises,
      sourceTemplateBlockIds: params.templateBlockIds,
    };

    const parsed = workoutSchema.safeParse(workout);

    if (!parsed.success) {
      throw new ServiceError('Workout data is invalid.', 'validation');
    }

    await this.workoutRepository.create(workout);
    return workout;
  }

  async completeWorkout(id: string): Promise<Workout> {
    return this.updateWorkoutStatus(id, 'completed');
  }

  async skipWorkout(id: string): Promise<Workout> {
    return this.updateWorkoutStatus(id, 'skipped');
  }

  async archiveWorkout(id: string): Promise<void> {
    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new ServiceError('Workout not found.', 'not_found');
    }

    if (!shouldArchiveWorkoutInsteadOfDelete(workout.status)) {
      throw new ServiceError('This workout cannot be archived.', 'invalid_operation');
    }

    await this.workoutRepository.archive(id);
  }

  async deleteWorkout(id: string): Promise<void> {
    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new ServiceError('Workout not found.', 'not_found');
    }

    if (!canHardDeleteWorkout(workout.status)) {
      throw new ServiceError('Completed or skipped workouts must be archived.', 'invalid_operation');
    }

    await this.workoutRepository.hardDelete(id);
  }

  private async updateWorkoutStatus(
    id: string,
    status: Extract<Workout['status'], 'completed' | 'skipped'>
  ): Promise<Workout> {
    const workout = await this.workoutRepository.findById(id);

    if (!workout) {
      throw new ServiceError('Workout not found.', 'not_found');
    }

    if (!workout.date) {
      throw new ServiceError('Workout date is required before updating status.', 'invalid_operation');
    }

    const updated: Workout = {
      ...workout,
      status,
      updatedAt: new Date(),
    };

    await this.workoutRepository.update(updated);
    return updated;
  }
}
