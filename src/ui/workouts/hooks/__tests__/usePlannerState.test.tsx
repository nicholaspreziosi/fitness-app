import { renderHook, act } from '@testing-library/react-native';
import { addWeeks } from '@/src/lib/dates/weekBounds';
import { usePlannerState } from '@/src/ui/workouts/hooks/usePlannerState';

describe('usePlannerState', () => {
  it('navigates weeks', () => {
    const { result } = renderHook(() => usePlannerState(new Date('2025-06-18T12:00:00.000Z')));

    act(() => {
      result.current.setWeekAnchor(addWeeks(result.current.weekAnchor, 1));
    });

    expect(result.current.weekAnchor.getDate()).toBe(25);
  });

  it('enters and exits edit mode', () => {
    const { result } = renderHook(() => usePlannerState());

    act(() => {
      result.current.enterEditMode('workout-1');
    });

    expect(result.current.editingWorkoutId).toBe('workout-1');

    act(() => {
      result.current.exitEditMode();
    });

    expect(result.current.editingWorkoutId).toBeNull();
  });

  it('opens and closes sheets', () => {
    const { result } = renderHook(() => usePlannerState());

    act(() => {
      result.current.openSheet({ type: 'addWorkout' });
    });

    expect(result.current.activeSheet.type).toBe('addWorkout');

    act(() => {
      result.current.closeSheet();
    });

    expect(result.current.activeSheet.type).toBe('none');
  });
});
