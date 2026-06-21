import type { UserProfile, UserProfileUpdate } from './userProfile.model';

export interface UserProfileRepository {
  findById(id: string): Promise<UserProfile | null>;
  create(profile: UserProfile): Promise<void>;
  update(id: string, update: UserProfileUpdate): Promise<void>;
}
