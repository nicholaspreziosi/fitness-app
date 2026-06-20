import { addWeeks } from '@/src/lib/dates/weekBounds';
import type { ExpandedWorkoutBounds } from '@/src/ui/workouts/hooks/useExpandedWorkoutSwipeBlock';
import * as React from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, type SharedValue } from 'react-native-reanimated';

type UseWeekSwipeGestureOptions = {
  weekAnchor: Date;
  onWeekChange: (nextAnchor: Date) => void;
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
  blockedRects,
}: UseWeekSwipeGestureOptions) {
  const startedInBlockedArea = useSharedValue(false);

  const changeWeek = React.useCallback(
    (direction: -1 | 1) => {
      onWeekChange(addWeeks(weekAnchor, direction));
    },
    [onWeekChange, weekAnchor]
  );

  return React.useMemo(() => {
    const goToPreviousWeek = () => changeWeek(-1);
    const goToNextWeek = () => changeWeek(1);

    const handleEnd = (translationX: number) => {
      'worklet';

      if (translationX > 50) {
        runOnJS(goToPreviousWeek)();
      } else if (translationX < -50) {
        runOnJS(goToNextWeek)();
      }
    };

    return Gesture.Pan()
      .activeOffsetX([-30, 30])
      .failOffsetY([-20, 20])
      .onTouchesDown((event) => {
        'worklet';

        const touch = event.allTouches[0];

        if (!touch || !blockedRects || blockedRects.value.length === 0) {
          startedInBlockedArea.value = false;
          return;
        }

        startedInBlockedArea.value = isPointInsideBounds(
          touch.absoluteX,
          touch.absoluteY,
          blockedRects.value
        );
      })
      .onEnd((event) => {
        'worklet';

        if (startedInBlockedArea.value) {
          return;
        }

        handleEnd(event.translationX);
      });
  }, [blockedRects, changeWeek, startedInBlockedArea, weekAnchor]);
}

export function useWeekSwipeWithScrollGesture({
  weekAnchor,
  onWeekChange,
  blockedRects,
}: UseWeekSwipeGestureOptions) {
  const weekSwipePan = useWeekSwipeGesture({ weekAnchor, onWeekChange, blockedRects });

  return React.useMemo(
    () => Gesture.Simultaneous(Gesture.Native(), weekSwipePan),
    [weekSwipePan]
  );
}
