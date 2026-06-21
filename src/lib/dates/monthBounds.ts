import { endOfDay, startOfDay } from '@/src/lib/dates/weekBounds';

export type MonthBounds = {
  monthStart: Date;
  monthEnd: Date;
};

const FULL_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function getMonthBounds(date: Date): MonthBounds {
  const monthStart = startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
  const monthEnd = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

  return { monthStart, monthEnd };
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function formatMonthLabel(date: Date): string {
  const monthName = FULL_MONTH_NAMES[date.getMonth()] ?? 'Month';
  return `${monthName} ${date.getFullYear()}`;
}
