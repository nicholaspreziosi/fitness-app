export const LBS_PER_KG = 2.2046226218;
export const CM_PER_INCH = 2.54;

export function lbsToKg(lbs: number): number {
  return lbs / LBS_PER_KG;
}

export function kgToLbs(kg: number): number {
  return kg * LBS_PER_KG;
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export type MeasurementSystem = 'imperial' | 'metric';

export function formatWeight(lbs: number, system: MeasurementSystem): string {
  if (system === 'metric') {
    return `${Math.round(lbsToKg(lbs) * 10) / 10} kg`;
  }

  return `${Math.round(lbs * 10) / 10} lbs`;
}

export function formatHeight(inches: number, system: MeasurementSystem): string {
  if (system === 'metric') {
    return `${Math.round(inchesToCm(inches) * 10) / 10} cm`;
  }

  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);

  if (feet === 0) {
    return `${remainingInches} in`;
  }

  return `${feet} ft ${remainingInches} in`;
}

export function formatWeightValue(lbs: number, system: MeasurementSystem): number {
  if (system === 'metric') {
    return Math.round(lbsToKg(lbs) * 10) / 10;
  }

  return Math.round(lbs * 10) / 10;
}
