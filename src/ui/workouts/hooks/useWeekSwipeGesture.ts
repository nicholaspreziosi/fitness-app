import { addWeeks } from '@/src/lib/dates/weekBounds';
import type { ExpandedWorkoutBounds } from '@/src/ui/workouts/hooks/useExpandedWorkoutSwipeBlock';
import * as React from 'react';
import { Gesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

type UseWeekSwipeGestureOptions = {
  weekAnchor: Date;
  onWeekChange: (nextAnchor: Date) => void;
  enabled?: boolean;
  blockedRects?: SharedValue<ExpandedWorkoutBounds[]>;
};

function isPointInsideBounds(
  x: number,
  y: number,
  bounds: ExpandedWorkoutBounds[]
): boolean {
  'worklet';

  for (const rect of bounds) {
    if (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    ) {
      return true;
    }
  }

  return false;
}

export function useWeekSwipeGesture({
  weekAnchor,
  onWeekChange,
  enabled = true,
  blockedRects,
}: UseWeekSwipeGestureOptions) {
  const goToPreviousWeek = React.useCallback(() => {
    onWeekChange(addWeeks(weekAnchor, -1));
  }, [onWeekChange, weekAnchor]);

  const goToNextWeek = React.useCallback(() => {
    onWeekChange(addWeeks(weekAnchor, 1));
  }, [onWeekChange, weekAnchor]);

  return React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .manualActivation(!!blockedRects)
        .activeOffsetX([-30, 30])
        .failOffsetY([-20, 20])
        .onTouchesDown((event, state) => {
          if (!blockedRects) {
            return;
          }

          const touch = event.allTouches[0];

          if (!touch) {
            state.fail();
            return;
          }

          if (isPointInsideBounds(touch.absoluteX, touch.absoluteY, blockedRects.value)) {
            state.fail();
            return;
          }

          state.begin();
        })
        .onEnd((event) => {
          if (event.translationX > 50) {
            runOnJS(goToPreviousWeek)();
          } else if (event.translationX < -50) {
            runOnJS(goToNextWeek)();
          }
        }),
    [blockedRects, enabled, goToNextWeek, goToPreviousWeek]
  );
}
