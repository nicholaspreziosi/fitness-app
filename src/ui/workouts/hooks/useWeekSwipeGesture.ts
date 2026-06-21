import { addWeeks } from '@/src/lib/dates/weekBounds';
import type { ExpandedWorkoutBounds } from '@/src/ui/workouts/hooks/useExpandedWorkoutSwipeBlock';
import { useHorizontalSwipeWithScrollGesture } from '@/src/ui/shared/hooks/useHorizontalSwipeWithScrollGesture';
import * as React from 'react';
import type { SharedValue } from 'react-native-reanimated';

type UseWeekSwipeGestureOptions = {
  weekAnchor: Date;
  onWeekChange: (nextAnchor: Date) => void;
  blockedRects?: SharedValue<ExpandedWorkoutBounds[]>;
};

export function useWeekSwipeWithScrollGesture({
  weekAnchor,
  onWeekChange,
  blockedRects,
}: UseWeekSwipeGestureOptions) {
  const changeWeek = React.useCallback(
    (direction: -1 | 1) => {
      onWeekChange(addWeeks(weekAnchor, direction));
    },
    [onWeekChange, weekAnchor]
  );

  const onSwipePrevious = React.useCallback(() => {
    changeWeek(-1);
  }, [changeWeek]);

  const onSwipeNext = React.useCallback(() => {
    changeWeek(1);
  }, [changeWeek]);

  return useHorizontalSwipeWithScrollGesture({
    onSwipePrevious,
    onSwipeNext,
    blockedRects,
  });
}
