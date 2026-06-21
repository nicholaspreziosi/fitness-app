import {
  cmToInches,
  formatHeight,
  formatWeight,
  inchesToCm,
  kgToLbs,
  lbsToKg,
} from '../convert';

describe('measurements convert', () => {
  it('converts lbs and kg', () => {
    expect(lbsToKg(220)).toBeCloseTo(99.8, 1);
    expect(kgToLbs(100)).toBeCloseTo(220.5, 1);
  });

  it('converts inches and cm', () => {
    expect(inchesToCm(70)).toBeCloseTo(177.8, 1);
    expect(cmToInches(180)).toBeCloseTo(70.9, 1);
  });

  it('formats weight for display', () => {
    expect(formatWeight(100, 'imperial')).toBe('100 lbs');
    expect(formatWeight(220, 'metric')).toContain('kg');
  });

  it('formats height for display', () => {
    expect(formatHeight(70, 'imperial')).toBe('5 ft 10 in');
    expect(formatHeight(70, 'metric')).toContain('cm');
  });
});
