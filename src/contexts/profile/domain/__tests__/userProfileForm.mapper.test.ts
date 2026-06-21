import type { UserProfile } from '../userProfile.model';
import { formOutputToProfileUpdate, userProfileToFormValues } from '../userProfileForm.mapper';

describe('userProfileForm.mapper', () => {
  const profile: UserProfile = {
    id: 'user-1',
    accountStatus: 'active',
    firstName: 'Nick',
    heightInches: 70,
    weightLbs: 180,
    measurementSystem: 'imperial',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  it('maps profile to imperial form values', () => {
    expect(userProfileToFormValues(profile)).toMatchObject({
      firstName: 'Nick',
      height: '70',
      weight: '180',
      measurementSystem: 'imperial',
    });
  });

  it('maps metric form output to canonical storage', () => {
    const update = formOutputToProfileUpdate({
      accountStatus: 'active',
      firstName: 'Nick',
      lastName: undefined,
      phone: '',
      language: undefined,
      country: '',
      timeZone: undefined,
      weekStartDay: '',
      gender: '',
      height: 177.8,
      weight: 81.6,
      activityLevel: '',
      fitnessLevel: '',
      measurementSystem: 'metric',
    });

    expect(update.heightInches).toBeCloseTo(70, 0);
    expect(update.weightLbs).toBeCloseTo(180, 0);
  });
});
