import { formatPrescription } from '@/src/lib/prescription/formatPrescription';

describe('formatPrescription', () => {
  it('formats sets, reps, weight, and hold', () => {
    expect(
      formatPrescription({
        sets: 2,
        reps: 10,
        weight: 50,
        holdSeconds: 5,
      })
    ).toBe('2 x 10 • 50 lbs • 5 Sec Hold');
  });

  it('formats hold-only prescriptions', () => {
    expect(formatPrescription({ holdSeconds: 45 })).toBe('45 Sec Hold');
  });

  it('formats weight in metric when configured', () => {
    expect(
      formatPrescription(
        {
          sets: 2,
          reps: 10,
          weight: 220,
        },
        { measurementSystem: 'metric' }
      )
    ).toContain('kg');
  });

  it('returns undefined when no values are set', () => {
    expect(formatPrescription({})).toBeUndefined();
  });
});
