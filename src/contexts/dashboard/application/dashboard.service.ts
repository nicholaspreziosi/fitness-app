import {
  calculateExerciseCompletionPercentage,
  calculateExerciseCompletionStats,
  calculateWorkoutCompletionStats,
} from '@/src/contexts/dashboard/domain/dashboardCompletion';
import { aggregateBodyPartCoverage } from '@/src/contexts/dashboard/domain/dashboardCoverage';
import {
  filterWorkoutsByViewMode,
  getDashboardRangeLabel,
} from '@/src/contexts/dashboard/domain/dashboardPeriod';
import type {
  CompletionStats,
  CoverageItem,
  DashboardEmptyStates,
  DashboardSummary,
  DashboardViewMode,
} from '@/src/contexts/dashboard/domain/dashboard.types';
import { getUpcomingWorkouts } from '@/src/contexts/dashboard/domain/dashboardUpcoming';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import type { WeekStartDay } from '@/src/lib/dates/weekBounds';

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
    viewMode: DashboardViewMode,
    anchorDate: Date = new Date(),
    weekStartDay: WeekStartDay = 1
  ): Workout[] {
    return getUpcomingWorkouts(workouts, viewMode, anchorDate, weekStartDay);
  }

  getDashboardSummary(
    workouts: Workout[],
    viewMode: DashboardViewMode,
    anchorDate: Date = new Date(),
    weekStartDay: WeekStartDay = 1
  ): DashboardSummary {
    const rangeWorkouts = filterWorkoutsByViewMode(workouts, viewMode, anchorDate, weekStartDay);
    const { workoutStats, exerciseStats } = this.getCompletionStats(rangeWorkouts);
    const coverage = this.getCoverageData(rangeWorkouts);
    const upcoming = this.getUpcomingWorkouts(workouts, viewMode, anchorDate, weekStartDay);
    const completionPercentage = this.getCompletionPercentage(rangeWorkouts);

    const emptyStates: DashboardEmptyStates = {
      noWorkouts: rangeWorkouts.length === 0,
      noCompletedData: workoutStats.completed === 0,
      noUpcoming: upcoming.length === 0,
      noChartData: coverage.length === 0,
    };

    return {
      viewMode,
      rangeLabel: getDashboardRangeLabel(viewMode, anchorDate, weekStartDay),
      workoutStats,
      exerciseStats,
      completionPercentage,
      coverage,
      upcoming,
      emptyStates,
    };
  }
}
