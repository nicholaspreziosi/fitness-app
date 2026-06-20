import {
  addWeeks,
  formatWeekLabel,
  getDayName,
  getWeekBounds,
  getWeekDays,
  isSameDay,
  startOfDay,
} from '@/src/lib/dates/weekBounds';

describe('weekBounds', () => {
  it('returns Monday-start week bounds', () => {
    const date = new Date('2025-06-18T12:00:00.000Z');
    const { weekStart, weekEnd } = getWeekBounds(date);

    expect(getDayName(weekStart)).toBe('Monday');
    expect(getDayName(weekEnd)).toBe('Sunday');
    expect(weekEnd.getTime()).toBeGreaterThan(weekStart.getTime());
  });

  it('formats week label within same month', () => {
    const weekStart = new Date('2025-06-16T00:00:00.000Z');
    const weekEnd = new Date('2025-06-22T23:59:59.999Z');

    expect(formatWeekLabel(weekStart, weekEnd)).toMatch(/Jun/);
  });

  it('returns seven week days', () => {
    const { weekStart } = getWeekBounds(new Date('2025-06-18T12:00:00.000Z'));
    const days = getWeekDays(weekStart);

    expect(days).toHaveLength(7);
    expect(getDayName(days[0]!)).toBe('Monday');
  });

  it('compares same day', () => {
    const a = startOfDay(new Date('2025-06-18T08:00:00.000Z'));
    const b = startOfDay(new Date('2025-06-18T20:00:00.000Z'));

    expect(isSameDay(a, b)).toBe(true);
  });

  it('adds weeks', () => {
    const date = new Date('2025-06-18T12:00:00.000Z');
    const next = addWeeks(date, 1);

    expect(next.getDate()).toBe(date.getDate() + 7);
  });
});
