export type PrescriptionValues = {
  sets?: number;
  reps?: number;
  weight?: number;
  holdSeconds?: number;
};

export function formatPrescription({
  sets,
  reps,
  weight,
  holdSeconds,
}: PrescriptionValues): string | undefined {
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
    parts.push(`${weight} lbs`);
  }

  if (holdSeconds !== undefined) {
    parts.push(`${holdSeconds} Sec Hold`);
  }

  return parts.length > 0 ? parts.join(' • ') : undefined;
}
