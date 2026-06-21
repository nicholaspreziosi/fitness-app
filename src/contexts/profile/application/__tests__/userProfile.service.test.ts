import { UserProfileService } from '../userProfile.service';
import type { UserProfile, UserProfileUpdate } from '@/src/contexts/profile/domain/userProfile.model';
import type { UserProfileRepository } from '@/src/contexts/profile/domain/userProfile.repository';
import { buildDefaultProfileFields } from '@/src/contexts/profile/domain/userProfile.rules';

jest.mock('@/src/lib/device/defaults', () => ({
  getDeviceDefaults: () => ({
    language: 'en-US',
    country: 'US',
    timeZone: 'America/New_York',
  }),
}));

function createRepositoryMock(): jest.Mocked<UserProfileRepository> {
  return {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
}

describe('UserProfileService', () => {
  it('creates default profile when missing', async () => {
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValueOnce(null).mockResolvedValueOnce(
      buildDefaultProfileFields('user-1', { country: 'US' })
    );
    repository.create.mockResolvedValue(undefined);

    const service = new UserProfileService(repository);
    const profile = await service.createDefaultProfile('user-1');

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(profile.accountStatus).toBe('active');
  });

  it('does not recreate existing profile', async () => {
    const existing = buildDefaultProfileFields('user-1', { country: 'US' });
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValue(existing);

    const service = new UserProfileService(repository);
    const profile = await service.createDefaultProfile('user-1');

    expect(repository.create).not.toHaveBeenCalled();
    expect(profile).toEqual(existing);
  });

  it('updates profile fields', async () => {
    const existing = buildDefaultProfileFields('user-1', { country: 'US' });
    const updated: UserProfile = { ...existing, firstName: 'Nick' };
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);
    repository.update.mockResolvedValue(undefined);

    const service = new UserProfileService(repository);
    const update: UserProfileUpdate = { firstName: 'Nick' };
    const result = await service.updateProfile('user-1', update);

    expect(repository.update).toHaveBeenCalledWith('user-1', update);
    expect(result.firstName).toBe('Nick');
  });
});
