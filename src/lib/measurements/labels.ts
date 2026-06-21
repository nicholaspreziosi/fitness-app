import type { MeasurementSystem } from './convert';

export function getWeightLabel(system: MeasurementSystem): string {
  return system === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';
}

export function getHeightLabel(system: MeasurementSystem): string {
  return system === 'metric' ? 'Height (cm)' : 'Height (in)';
}

export function getActualWeightLabel(system: MeasurementSystem): string {
  return system === 'metric' ? 'Actual Weight (kg)' : 'Actual Weight (lbs)';
}
