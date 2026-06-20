import {
  calculateExerciseCompletionPercentage,
  calculateExerciseCompletionStats,
  calculateWorkoutCompletionStats,
} from '@/src/contexts/dashboard/domain/dashboardCompletion';
import { aggregateBodyPartCoverage } from '@/src/contexts/dashboard/domain/dashboardCoverage';
import { filterWorkoutsByPeriod, getPeriodLabel } from '@/src/contexts/dashboard/domain/dashboardPeriod';
import type {
  CompletionStats,
  CoverageItem,
  DashboardEmptyStates,
  DashboardPeriod,
  DashboardSummary,
} from '@/src/contexts/dashboard/domain/dashboard.types';
import { getUpcomingWorkouts } from '@/src/contexts/dashboard/domain/dashboardUpcoming';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';

export class DashboardService {
  getCompletionStats(workouts: Workout[]): {
    workoutStats: CompletionStats;
    exerciseStats: CompletionStats;
  } {
    return {
      workoutStats: calculateWorkoutCompletionStats(workouts),
      exerciseStats: calculateExerciseCompletionStats(workouts),
    };
  }

  getCompletionPercentage(workouts: Workout[]): number {
    return calculateExerciseCompletionPercentage(workouts);
  }

  getCoverageData(workouts: Workout[]): CoverageItem[] {
    return aggregateBodyPartCoverage(workouts);
  }

  getUpcomingWorkouts(
    workouts: Workout[],
    period: DashboardPeriod,
    referenceDate: Date = new Date()
  ): Workout[] {
    return getUpcomingWorkouts(workouts, period, referenceDate);
  }

  getDashboardSummary(
    workouts: Workout[],
    period: DashboardPeriod,
    referenceDate: Date = new Date()
  ): DashboardSummary {
    const periodWorkouts = filterWorkoutsByPeriod(workouts, period, referenceDate);
    const { workoutStats, exerciseStats } = this.getCompletionStats(periodWorkouts);
    const coverage = this.getCoverageData(periodWorkouts);
    const upcoming = this.getUpcomingWorkouts(workouts, period, referenceDate);
    const completionPercentage = this.getCompletionPercentage(periodWorkouts);

    const emptyStates: DashboardEmptyStates = {
      noWorkouts: periodWorkouts.length === 0,
      noCompletedData: workoutStats.completed === 0,
      noUpcoming: upcoming.length === 0,
      noChartData: coverage.length === 0,
    };

    return {
      period,
      periodLabel: getPeriodLabel(period, referenceDate),
      workoutStats,
      exerciseStats,
      completionPercentage,
      coverage,
      upcoming,
      emptyStates,
    };
  }
}
