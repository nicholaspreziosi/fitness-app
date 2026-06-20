import { endOfDay, startOfDay } from '@/src/lib/dates/weekBounds';

export type MonthBounds = {
  monthStart: Date;
  monthEnd: Date;
};

export function getMonthBounds(date: Date): MonthBounds {
  const monthStart = startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
  const monthEnd = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

  return { monthStart, monthEnd };
}
