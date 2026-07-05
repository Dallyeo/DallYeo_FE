import type { UserProfile, UserProfilePatch } from '@/domain/types';

/** 프로필 Repository (계약, V13). 구현은 U6에서(백엔드/MSW). */
export interface ProfileRepository {
  get(): Promise<UserProfile>;
  update(patch: UserProfilePatch): Promise<UserProfile>;
}
