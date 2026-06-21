import type { DashboardPeriod } from '@/src/contexts/dashboard/domain/dashboard.types';
import { CompletionDonutChart } from '@/src/ui/dashboard/components/CompletionDonutChart';
import { CoverageBarChart } from '@/src/ui/dashboard/components/CoverageBarChart';
import { DashboardEmptyState } from '@/src/ui/dashboard/components/DashboardEmptyState';
import { DashboardPeriodFilter } from '@/src/ui/dashboard/components/DashboardPeriodFilter';
import { DashboardStatCard } from '@/src/ui/dashboard/components/DashboardStatCard';
import {
  UpcomingSectionHeader,
  UpcomingWorkoutList,
} from '@/src/ui/dashboard/components/UpcomingWorkoutList';
import { useDashboardSummary } from '@/src/ui/dashboard/hooks/useDashboardSummary';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { useState } from 'react';
import { View } from 'react-native';

export function DashboardView() {
  const [period, setPeriod] = useState<DashboardPeriod>('thisWeek');
  const { summary, isLoading, isRefreshing, refetch } = useDashboardSummary(period);

  return (
    <ScreenContainer
      refreshing={isRefreshing}
      onRefresh={async () => {
        await refetch();
      }}>
      <PageHeader title="Dashboard" description="Track training consistency and coverage." />

      {isLoading ? (
        <LoadingState />
      ) : (
        <View className="gap-4">
          <DashboardPeriodFilter value={period} onChange={setPeriod} />

          {summary.emptyStates.noWorkouts ? (
            <DashboardEmptyState message="No workouts planned for this period." />
          ) : null}

          {!summary.emptyStates.noWorkouts ? (
            <>
              <View className="flex-row gap-3">
                <DashboardStatCard
                  completed={summary.workoutStats.completed}
                  total={summary.workoutStats.total}
                  label="Workouts"
                  testID="workout-stat-card"
                />
                <DashboardStatCard
                  completed={summary.exerciseStats.completed}
                  total={summary.exerciseStats.total}
                  label="Exercises"
                  testID="exercise-stat-card"
                />
              </View>

              {summary.emptyStates.noCompletedData ? (
                <DashboardEmptyState message="No completed workouts yet." />
              ) : null}

              <CompletionDonutChart
                percentage={summary.completionPercentage}
                isEmpty={summary.emptyStates.noChartData}
              />

              <CoverageBarChart coverage={summary.coverage} isEmpty={summary.emptyStates.noChartData} />

              <UpcomingSectionHeader />
              <UpcomingWorkoutList
                workouts={summary.upcoming}
                isEmpty={summary.emptyStates.noUpcoming}
              />
            </>
          ) : null}
        </View>
      )}
    </ScreenContainer>
  );
}
