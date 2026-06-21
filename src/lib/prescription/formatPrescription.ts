import { formatWeight } from '@/src/lib/measurements/convert';

export type PrescriptionValues = {
  sets?: number;
  reps?: number;
  weight?: number;
  holdSeconds?: number;
};

export type PrescriptionFormatOptions = {
  measurementSystem?: 'imperial' | 'metric';
};

export function formatPrescription(
  { sets, reps, weight, holdSeconds }: PrescriptionValues,
  options: PrescriptionFormatOptions = {}
): string | undefined {
  const measurementSystem = options.measurementSystem ?? 'imperial';

  if (
    sets === undefined &&
    reps === undefined &&
    weight === undefined &&
    holdSeconds === undefined
  ) {
    return undefined;
  }

  const parts: string[] = [];

  if (sets !== undefined && reps !== undefined) {
    parts.push(`${sets} x ${reps}`);
  } else if (sets !== undefined) {
    parts.push(`${sets} sets`);
  } else if (reps !== undefined) {
    parts.push(`${reps} reps`);
  }

  if (weight !== undefined) {
    parts.push(formatWeight(weight, measurementSystem));
  }

  if (holdSeconds !== undefined) {
    parts.push(`${holdSeconds} Sec Hold`);
  }

  return parts.length > 0 ? parts.join(' • ') : undefined;
}
