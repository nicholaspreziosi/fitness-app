import { addMonths } from '@/src/lib/dates/monthBounds';
import { addWeeks, startOfDay } from '@/src/lib/dates/weekBounds';
import { useDashboardViewState } from '@/src/ui/dashboard/hooks/useDashboardViewState';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';
import { act, renderHook } from '@testing-library/react-native';

describe('useDashboardViewState', () => {
  it('defaults to week view with a normalized anchor date', () => {
    const { result } = renderHook(() => useDashboardViewState(FIXED_DATE));

    expect(result.current.viewMode).toBe('week');
    expect(result.current.anchorDate).toEqual(startOfDay(FIXED_DATE));
  });

  it('navigates weeks and months from the anchor date', () => {
    const { result } = renderHook(() => useDashboardViewState(FIXED_DATE));

    act(() => {
      result.current.goToNext();
    });

    expect(result.current.anchorDate).toEqual(startOfDay(addWeeks(FIXED_DATE, 1)));

    act(() => {
      result.current.setViewMode('month');
    });

    act(() => {
      result.current.goToPrevious();
    });

    expect(result.current.viewMode).toBe('month');
    expect(result.current.anchorDate).toEqual(
      startOfDay(addMonths(startOfDay(addWeeks(FIXED_DATE, 1)), -1))
    );
  });

  it('jumps to a selected date', () => {
    const { result } = renderHook(() => useDashboardViewState(FIXED_DATE));
    const targetDate = createTestDate(14);

    act(() => {
      result.current.goToDate(targetDate);
    });

    expect(result.current.anchorDate).toEqual(startOfDay(targetDate));
  });
});
