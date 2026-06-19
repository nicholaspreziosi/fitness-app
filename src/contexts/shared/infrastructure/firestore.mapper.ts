import { Timestamp } from 'firebase/firestore';

export function dateToTimestamp(value: Date): Timestamp {
  return Timestamp.fromDate(value);
}

export function timestampToDate(value: Timestamp | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  return value.toDate();
}

export function optionalTimestampToDate(
  value: Timestamp | Date | null | undefined
): Date | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return timestampToDate(value);
}

export function optionalDateToTimestamp(value: Date | undefined): Timestamp | undefined {
  if (value === undefined) {
    return undefined;
  }

  return dateToTimestamp(value);
}

export function stripUndefinedFields<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as T;
}
