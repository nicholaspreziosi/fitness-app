import { buildDefaultProfileFields } from '@/src/contexts/profile/domain/userProfile.rules';
import type { UserProfile, UserProfileUpdate } from '@/src/contexts/profile/domain/userProfile.model';
import type { UserProfileRepository } from '@/src/contexts/profile/domain/userProfile.repository';
import { userProfileUpdateSchema } from '@/src/contexts/profile/domain/userProfile.schema';
import { ServiceError } from '@/src/contexts/shared/domain/service.errors';
import { getDeviceDefaults } from '@/src/lib/device/defaults';

export class UserProfileService {
  constructor(private readonly repository: UserProfileRepository) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.repository.findById(userId);
  }

  async getOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.repository.findById(userId);

    if (existing) {
      return existing;
    }

    return this.createDefaultProfile(userId);
  }

  async createDefaultProfile(userId: string): Promise<UserProfile> {
    const existing = await this.repository.findById(userId);

    if (existing) {
      return existing;
    }

    const profile = buildDefaultProfileFields(userId, getDeviceDefaults());
    await this.repository.create(profile);
    return profile;
  }

  async updateProfile(userId: string, update: UserProfileUpdate): Promise<UserProfile> {
    const parsed = userProfileUpdateSchema.safeParse(update);

    if (!parsed.success) {
      throw new ServiceError('Invalid profile update.', 'validation');
    }

    const existing = await this.repository.findById(userId);

    if (!existing) {
      throw new ServiceError('Profile not found.', 'not_found');
    }

    await this.repository.update(userId, parsed.data);
    const updated = await this.repository.findById(userId);

    if (!updated) {
      throw new ServiceError('Profile not found after update.', 'not_found');
    }

    return updated;
  }
}
