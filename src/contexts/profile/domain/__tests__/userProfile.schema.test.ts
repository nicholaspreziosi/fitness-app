import { userProfileSchema } from '../userProfile.schema';

describe('userProfileSchema', () => {
  const baseProfile = {
    id: 'user-1',
    accountStatus: 'active' as const,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  it('accepts a valid profile with optional fields', () => {
    const result = userProfileSchema.safeParse({
      ...baseProfile,
      firstName: 'Nick',
      fitnessLevel: 'intermediate',
      weekStartDay: 0,
      measurementSystem: 'imperial',
      heightInches: 70,
      weightLbs: 180,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid fitness level', () => {
    const result = userProfileSchema.safeParse({
      ...baseProfile,
      fitnessLevel: 'pro',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid week start day', () => {
    const result = userProfileSchema.safeParse({
      ...baseProfile,
      weekStartDay: 7,
    });

    expect(result.success).toBe(false);
  });
});
