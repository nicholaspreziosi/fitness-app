import { getMonthBounds } from '@/src/lib/dates/monthBounds';
import { endOfDay, startOfDay } from '@/src/lib/dates/weekBounds';

describe('getMonthBounds', () => {
  it('returns the first and last day of the month', () => {
    const date = new Date('2025-06-18T12:00:00.000Z');
    const { monthStart, monthEnd } = getMonthBounds(date);

    expect(monthStart).toEqual(startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)));
    expect(monthEnd).toEqual(
      endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0))
    );
  });

  it('handles months with 31 days', () => {
    const date = new Date('2025-01-15T12:00:00.000Z');
    const { monthStart, monthEnd } = getMonthBounds(date);

    expect(monthStart.getDate()).toBe(1);
    expect(monthEnd.getDate()).toBe(31);
    expect(monthStart.getMonth()).toBe(0);
    expect(monthEnd.getMonth()).toBe(0);
  });

  it('handles February in a non-leap year', () => {
    const date = new Date('2025-02-10T12:00:00.000Z');
    const { monthEnd } = getMonthBounds(date);

    expect(monthEnd.getDate()).toBe(28);
    expect(monthEnd.getMonth()).toBe(1);
  });
});
