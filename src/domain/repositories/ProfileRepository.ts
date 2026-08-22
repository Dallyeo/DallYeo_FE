import type { UserProfile, UserProfilePatch } from '@/domain/types';

/** 프로필 Repository (V13). 백엔드 `GET/PATCH/DELETE /users/me` (backend-api.md §6). */
export interface ProfileRepository {
  get(): Promise<UserProfile>;
  update(patch: UserProfilePatch): Promise<UserProfile>;
  /** 계정 삭제(탈퇴) — 하드 삭제. 204 반환. */
  remove(): Promise<void>;
}
