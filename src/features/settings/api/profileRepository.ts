import type { ProfileRepository } from '@/domain/repositories';
import type { Gender, UserProfile, UserProfilePatch } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';

/** 백엔드 프로필 응답 (backend-api.md §6.1) */
interface UserDto {
  id: number | string;
  nickname: string;
  gender?: 'MALE' | 'FEMALE' | 'NONE' | null;
  height?: number | null;
  weight?: number | null;
  /** 저장 방식 미정으로 현재 항상 null */
  profileImageUrl?: string | null;
}

const GENDER_FROM: Record<string, Gender> = {
  MALE: 'male',
  FEMALE: 'female',
  NONE: 'unspecified',
};
const GENDER_TO: Record<Gender, 'MALE' | 'FEMALE' | 'NONE'> = {
  male: 'MALE',
  female: 'FEMALE',
  unspecified: 'NONE',
};

function toProfile(d: UserDto): UserProfile {
  return {
    nickname: d.nickname,
    ...(d.profileImageUrl ? { photoUrl: d.profileImageUrl } : {}),
    ...(d.height != null ? { heightCm: d.height } : {}),
    ...(d.weight != null ? { weightKg: d.weight } : {}),
    ...(d.gender && GENDER_FROM[d.gender] ? { gender: GENDER_FROM[d.gender] } : {}),
  };
}

/** 도메인 → 백엔드 필드명. **전달한 필드만** 부분 갱신된다(§6.2). */
function toBody(patch: UserProfilePatch): Record<string, unknown> {
  return {
    ...(patch.nickname !== undefined ? { nickname: patch.nickname } : {}),
    ...(patch.heightCm !== undefined ? { height: patch.heightCm } : {}),
    ...(patch.weightKg !== undefined ? { weight: patch.weightKg } : {}),
    ...(patch.gender !== undefined ? { gender: GENDER_TO[patch.gender] } : {}),
  };
}

/**
 * 프로필 (backend-api.md §6). `GET/PATCH /users/me`.
 * ⚠️ 프로필 사진은 백엔드가 저장을 지원하지 않아(`profileImageUrl` 항상 null) 전송하지 않는다.
 */
export const profileRepository: ProfileRepository = {
  async get(): Promise<UserProfile> {
    return toProfile(await apiClient.get<UserDto>('/users/me'));
  },
  async update(patch: UserProfilePatch): Promise<UserProfile> {
    return toProfile(await apiClient.patch<UserDto>('/users/me', toBody(patch)));
  },
  async remove(): Promise<void> {
    await apiClient.delete<void>('/users/me');
  },
};
