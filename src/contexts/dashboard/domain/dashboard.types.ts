export const DASHBOARD_VIEW_MODES = ['week', 'month'] as const;

export type DashboardViewMode = (typeof DASHBOARD_VIEW_MODES)[number];

export type CompletionStats = {
  completed: number;
  total: number;
};

export type CoverageItem = {
  bodyPart: string;
  count: number;
};

export type DashboardEmptyStates = {
  noWorkouts: boolean;
  noCompletedData: boolean;
  noUpcoming: boolean;
  noChartData: boolean;
};

export type DashboardSummary = {
  viewMode: DashboardViewMode;
  rangeLabel: string;
  workoutStats: CompletionStats;
  exerciseStats: CompletionStats;
  completionPercentage: number;
  coverage: CoverageItem[];
  upcoming: import('@/src/contexts/workouts/domain/workout.model').Workout[];
  emptyStates: DashboardEmptyStates;
};
