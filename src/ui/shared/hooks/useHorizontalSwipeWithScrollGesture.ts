import * as React from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, type SharedValue } from 'react-native-reanimated';

export type SwipeBlockRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type UseHorizontalSwipeGestureOptions = {
  onSwipePrevious: () => void;
  onSwipeNext: () => void;
  blockedRects?: SharedValue<SwipeBlockRect[]>;
};

function isPointInsideBounds(x: number, y: number, bounds: SwipeBlockRect[]): boolean {
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

export function useHorizontalSwipeGesture({
  onSwipePrevious,
  onSwipeNext,
  blockedRects,
}: UseHorizontalSwipeGestureOptions) {
  const startedInBlockedArea = useSharedValue(false);

  return React.useMemo(() => {
    const goPrevious = () => onSwipePrevious();
    const goNext = () => onSwipeNext();

    const handleEnd = (translationX: number) => {
      'worklet';

      if (translationX > 50) {
        runOnJS(goPrevious)();
      } else if (translationX < -50) {
        runOnJS(goNext)();
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
  }, [blockedRects, onSwipeNext, onSwipePrevious, startedInBlockedArea]);
}

export function useHorizontalSwipeWithScrollGesture(options: UseHorizontalSwipeGestureOptions) {
  const swipePan = useHorizontalSwipeGesture(options);

  return React.useMemo(
    () => Gesture.Simultaneous(Gesture.Native(), swipePan),
    [swipePan]
  );
}
