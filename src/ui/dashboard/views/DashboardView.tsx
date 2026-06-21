import { CompletionDonutChart } from '@/src/ui/dashboard/components/CompletionDonutChart';
import { CoverageBarChart } from '@/src/ui/dashboard/components/CoverageBarChart';
import { DashboardEmptyState } from '@/src/ui/dashboard/components/DashboardEmptyState';
import { DashboardViewModeFilter } from '@/src/ui/dashboard/components/DashboardViewModeFilter';
import { DashboardStatCard } from '@/src/ui/dashboard/components/DashboardStatCard';
import {
  UpcomingSectionHeader,
  UpcomingWorkoutList,
} from '@/src/ui/dashboard/components/UpcomingWorkoutList';
import { useDashboardSummary } from '@/src/ui/dashboard/hooks/useDashboardSummary';
import { useDashboardViewState } from '@/src/ui/dashboard/hooks/useDashboardViewState';
import { DatePickerSheet } from '@/src/ui/shared/components/DatePickerSheet';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { MonthNavigator } from '@/src/ui/shared/components/MonthNavigator';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { useHorizontalSwipeWithScrollGesture } from '@/src/ui/shared/hooks/useHorizontalSwipeWithScrollGesture';
import { WeekNavigator } from '@/src/ui/workouts/components/WeekNavigator';
import * as React from 'react';
import { Modal, View } from 'react-native';

export function DashboardView() {
  const { viewMode, setViewMode, anchorDate, goToPrevious, goToNext, goToDate } =
    useDashboardViewState();
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const { summary, isLoading, isRefreshing, refetch } = useDashboardSummary(viewMode, {
    anchorDate,
  });
  const scrollSwipeGesture = useHorizontalSwipeWithScrollGesture({
    onSwipePrevious: goToPrevious,
    onSwipeNext: goToNext,
  });

  return (
    <>
      <ScreenContainer
        scrollGesture={scrollSwipeGesture}
        refreshing={isRefreshing}
        onRefresh={async () => {
          await refetch();
        }}>
        <PageHeader title="Dashboard" description="Track training consistency and coverage." />

        {isLoading ? (
          <LoadingState />
        ) : (
          <View className="gap-4">
            <DashboardViewModeFilter value={viewMode} onChange={setViewMode} />

            {viewMode === 'week' ? (
              <WeekNavigator
                weekAnchor={anchorDate}
                onPreviousWeek={goToPrevious}
                onNextWeek={goToNext}
                onOpenWeekPicker={() => setDatePickerOpen(true)}
              />
            ) : (
              <MonthNavigator
                monthAnchor={anchorDate}
                onPreviousMonth={goToPrevious}
                onNextMonth={goToNext}
                onOpenMonthPicker={() => setDatePickerOpen(true)}
              />
            )}

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

                <CoverageBarChart
                  coverage={summary.coverage}
                  isEmpty={summary.emptyStates.noChartData}
                />

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

      <Modal
        visible={datePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDatePickerOpen(false)}>
        <DatePickerSheet
          title={viewMode === 'week' ? 'Go to Week' : 'Go to Month'}
          value={anchorDate}
          confirmLabel="Go"
          onClose={() => setDatePickerOpen(false)}
          onConfirm={(date) => {
            goToDate(date);
            setDatePickerOpen(false);
          }}
        />
      </Modal>
    </>
  );
}
