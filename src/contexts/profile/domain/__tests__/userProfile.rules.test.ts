import {
  buildDefaultProfileFields,
  canUseTrainingFeatures,
  inferMeasurementSystem,
  inferWeekStartDay,
  isAccountPaused,
} from '../userProfile.rules';

describe('userProfile.rules', () => {
  it('detects paused accounts', () => {
    const profile = buildDefaultProfileFields('user-1', { country: 'US' });
    expect(isAccountPaused(profile)).toBe(false);

    expect(isAccountPaused({ ...profile, accountStatus: 'paused' })).toBe(true);
  });

  it('allows training features only for active accounts', () => {
    const profile = buildDefaultProfileFields('user-1', { country: 'US' });
    expect(canUseTrainingFeatures(profile)).toBe(true);
    expect(canUseTrainingFeatures({ ...profile, accountStatus: 'paused' })).toBe(false);
  });

  it('infers imperial for US', () => {
    expect(inferMeasurementSystem('US')).toBe('imperial');
    expect(inferMeasurementSystem('DE')).toBe('metric');
  });

  it('infers week start day from locale', () => {
    expect(inferWeekStartDay('en-US')).toBe(0);
    expect(inferWeekStartDay('en-GB')).toBe(1);
  });

  it('builds default profile fields', () => {
    const profile = buildDefaultProfileFields('user-1', {
      language: 'en-US',
      country: 'US',
      timeZone: 'America/New_York',
    });

    expect(profile.id).toBe('user-1');
    expect(profile.accountStatus).toBe('active');
    expect(profile.measurementSystem).toBe('imperial');
    expect(profile.weekStartDay).toBe(0);
  });
});
