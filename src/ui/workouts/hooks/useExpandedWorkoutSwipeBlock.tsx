import * as React from 'react';
import { View } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

export type ExpandedWorkoutBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ExpandedWorkoutSwipeBlockContextValue = {
  blockedRects: SharedValue<ExpandedWorkoutBounds[]>;
  updateExpandedBounds: (workoutId: string, bounds: ExpandedWorkoutBounds) => void;
  clearExpandedBounds: (workoutId: string) => void;
};

const ExpandedWorkoutSwipeBlockContext =
  React.createContext<ExpandedWorkoutSwipeBlockContextValue | null>(null);

export function ExpandedWorkoutSwipeBlockProvider({ children }: { children: React.ReactNode }) {
  const blockedRects = useSharedValue<ExpandedWorkoutBounds[]>([]);
  const boundsByWorkoutIdRef = React.useRef(new Map<string, ExpandedWorkoutBounds>());

  const syncBlockedRects = React.useCallback(() => {
    blockedRects.value = Array.from(boundsByWorkoutIdRef.current.values());
  }, [blockedRects]);

  const updateExpandedBounds = React.useCallback(
    (workoutId: string, bounds: ExpandedWorkoutBounds) => {
      boundsByWorkoutIdRef.current.set(workoutId, bounds);
      syncBlockedRects();
    },
    [syncBlockedRects]
  );

  const clearExpandedBounds = React.useCallback(
    (workoutId: string) => {
      boundsByWorkoutIdRef.current.delete(workoutId);
      syncBlockedRects();
    },
    [syncBlockedRects]
  );

  const value = React.useMemo(
    () => ({
      blockedRects,
      updateExpandedBounds,
      clearExpandedBounds,
    }),
    [blockedRects, clearExpandedBounds, updateExpandedBounds]
  );

  return (
    <ExpandedWorkoutSwipeBlockContext.Provider value={value}>
      {children}
    </ExpandedWorkoutSwipeBlockContext.Provider>
  );
}

export function useExpandedWorkoutSwipeBlock() {
  const context = React.useContext(ExpandedWorkoutSwipeBlockContext);

  if (!context) {
    throw new Error(
      'useExpandedWorkoutSwipeBlock must be used within ExpandedWorkoutSwipeBlockProvider'
    );
  }

  return context;
}

export function useRegisterExpandedWorkoutSwipeBlock(
  workoutId: string,
  isExpanded: boolean,
  cardRef: React.RefObject<View | null>
) {
  const { updateExpandedBounds, clearExpandedBounds } = useExpandedWorkoutSwipeBlock();

  const measureBounds = React.useCallback(() => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      updateExpandedBounds(workoutId, { x, y, width, height });
    });
  }, [cardRef, updateExpandedBounds, workoutId]);

  React.useEffect(() => {
    if (!isExpanded) {
      clearExpandedBounds(workoutId);
      return;
    }

    measureBounds();
  }, [clearExpandedBounds, isExpanded, measureBounds, workoutId]);

  return measureBounds;
}
