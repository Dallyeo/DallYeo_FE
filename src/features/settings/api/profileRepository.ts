import type { ProfileRepository } from '@/domain/repositories';
import type { UserProfile, UserProfilePatch } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';

export const profileRepository: ProfileRepository = {
  get(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/me');
  },
  update(patch: UserProfilePatch): Promise<UserProfile> {
    return apiClient.patch<UserProfile>('/me', patch);
  },
};
