const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export type WeekBounds = {
  weekStart: Date;
  weekEnd: Date;
};

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getWeekBounds(date: Date, weekStartsOn: 0 | 1 = 1): WeekBounds {
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  const weekStart = startOfDay(new Date(date));
  weekStart.setDate(weekStart.getDate() - diff);

  const weekEnd = endOfDay(new Date(weekStart));
  weekEnd.setDate(weekEnd.getDate() + 6);

  return { weekStart, weekEnd };
}

export function formatWeekLabel(weekStart: Date, weekEnd: Date): string {
  const startMonth = MONTH_NAMES[weekStart.getMonth()];
  const endMonth = MONTH_NAMES[weekEnd.getMonth()];

  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}`;
  }

  return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}`;
}

export function getDayName(date: Date): string {
  return DAY_NAMES[date.getDay()] ?? 'Monday';
}

export function formatDayLabel(date: Date): string {
  return `${getDayName(date)}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = startOfDay(new Date(weekStart));
    day.setDate(day.getDate() + index);
    return day;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}
