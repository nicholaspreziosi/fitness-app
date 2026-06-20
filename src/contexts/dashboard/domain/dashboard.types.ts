export const DASHBOARD_PERIODS = ['thisWeek', 'nextWeek', 'thisMonth'] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

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
  period: DashboardPeriod;
  periodLabel: string;
  workoutStats: CompletionStats;
  exerciseStats: CompletionStats;
  completionPercentage: number;
  coverage: CoverageItem[];
  upcoming: import('@/src/contexts/workouts/domain/workout.model').Workout[];
  emptyStates: DashboardEmptyStates;
};
