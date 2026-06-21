import { addMonths, formatMonthLabel, getMonthBounds } from '@/src/lib/dates/monthBounds';
import { createTestDate, FIXED_DATE } from '@/test-utils/testDates';

describe('getMonthBounds', () => {
  it('returns the first and last day of the month', () => {
    const referenceDate = FIXED_DATE;
    const { monthStart, monthEnd } = getMonthBounds(referenceDate);

    expect(monthStart.getFullYear()).toBe(2024);
    expect(monthStart.getMonth()).toBe(5);
    expect(monthStart.getDate()).toBe(1);

    expect(monthEnd.getFullYear()).toBe(2024);
    expect(monthEnd.getMonth()).toBe(5);
    expect(monthEnd.getDate()).toBe(30);
  });
});

describe('addMonths', () => {
  it('moves to the previous month', () => {
    const result = addMonths(FIXED_DATE, -1);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(15);
  });

  it('moves to the next month', () => {
    const result = addMonths(FIXED_DATE, 1);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(15);
  });
});

describe('formatMonthLabel', () => {
  it('formats the month and year', () => {
    expect(formatMonthLabel(createTestDate(0))).toBe('June 2024');
  });
});
