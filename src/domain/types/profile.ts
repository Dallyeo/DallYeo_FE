/**
 * 사용자 프로필 (V13 설정/내정보수정). 신체 정보는 온보딩과 동일 필드 재사용.
 */
import type { Gender } from './onboarding';

export interface UserProfile {
  nickname: string;
  /** 프로필 사진 URL (네이티브 pickProfilePhoto 결과) */
  photoUrl?: string;
  heightCm?: number;
  weightKg?: number;
  gender?: Gender;
}

/** 내정보 수정 시 부분 갱신 페이로드 */
export type UserProfilePatch = Partial<UserProfile>;
