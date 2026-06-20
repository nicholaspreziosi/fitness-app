import * as React from 'react';

export type PlannerSheet =
  | { type: 'none' }
  | { type: 'addWorkout'; date?: Date }
  | { type: 'duplicateWorkout'; workoutId: string }
  | { type: 'addExercise'; workoutId: string }
  | { type: 'addTemplate'; workoutId: string }
  | { type: 'weekPicker' };

export function usePlannerState(initialWeekAnchor = new Date()) {
  const [weekAnchor, setWeekAnchor] = React.useState(initialWeekAnchor);
  const [expandedWorkoutId, setExpandedWorkoutId] = React.useState<string | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = React.useState<string | null>(null);
  const [activeSheet, setActiveSheet] = React.useState<PlannerSheet>({ type: 'none' });
  const [dropMessage, setDropMessage] = React.useState<string | null>(null);

  const enterEditMode = React.useCallback((workoutId: string) => {
    setEditingWorkoutId(workoutId);
    setExpandedWorkoutId(workoutId);
  }, []);

  const exitEditMode = React.useCallback(() => {
    setEditingWorkoutId(null);
    setExpandedWorkoutId(null);
  }, []);

  const toggleExpanded = React.useCallback((workoutId: string) => {
    setExpandedWorkoutId((current) => (current === workoutId ? null : workoutId));
    setEditingWorkoutId(null);
  }, []);

  const openSheet = React.useCallback((sheet: PlannerSheet) => {
    setActiveSheet(sheet);
  }, []);

  const closeSheet = React.useCallback(() => {
    setActiveSheet({ type: 'none' });
  }, []);

  const showDropMessage = React.useCallback((message: string) => {
    setDropMessage(message);
  }, []);

  const clearDropMessage = React.useCallback(() => {
    setDropMessage(null);
  }, []);

  return {
    weekAnchor,
    setWeekAnchor,
    expandedWorkoutId,
    editingWorkoutId,
    activeSheet,
    dropMessage,
    enterEditMode,
    exitEditMode,
    toggleExpanded,
    openSheet,
    closeSheet,
    showDropMessage,
    clearDropMessage,
  };
}

export type PlannerState = ReturnType<typeof usePlannerState>;
