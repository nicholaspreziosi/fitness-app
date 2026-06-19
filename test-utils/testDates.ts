export const FIXED_DATE = new Date('2024-06-15T12:00:00.000Z');

export function createTestDate(offsetDays = 0): Date {
  const date = new Date(FIXED_DATE);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date;
}
