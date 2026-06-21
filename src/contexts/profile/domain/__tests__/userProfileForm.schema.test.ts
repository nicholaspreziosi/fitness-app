import { userProfileFormSchema } from '../userProfileForm.schema';

describe('userProfileFormSchema', () => {
  it('parses valid form values', () => {
    const result = userProfileFormSchema.safeParse({
      accountStatus: 'active',
      firstName: 'Nick',
      lastName: 'Prez',
      phone: '+15551234567',
      language: 'en-US',
      country: 'US',
      timeZone: 'America/New_York',
      weekStartDay: '0',
      gender: 'male',
      height: '70',
      weight: '180',
      activityLevel: 'moderately_active',
      fitnessLevel: 'intermediate',
      measurementSystem: 'imperial',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.height).toBe(70);
      expect(result.data.weight).toBe(180);
    }
  });

  it('rejects invalid phone numbers', () => {
    const result = userProfileFormSchema.safeParse({
      accountStatus: 'active',
      phone: 'abc',
      measurementSystem: 'imperial',
    });

    expect(result.success).toBe(false);
  });
});
