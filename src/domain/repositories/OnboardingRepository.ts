import type { OnboardingProfile, OnboardingState } from '@/domain/types';

/** 온보딩 Repository (계약). 구현은 U2에서. */
export interface OnboardingRepository {
  getState(): Promise<OnboardingState>;
  saveProfile(profile: OnboardingProfile): Promise<void>;
  /** 완료/건너뛰기 공통 완료 플래그 */
  markCompleted(): Promise<void>;
  /**
   * 온보딩 기록 전체 삭제 — 완료 플래그 + 저장된 신체정보.
   * 회원탈퇴처럼 "이 기기에 남은 사용자 흔적"을 지워야 할 때 사용한다.
   */
  reset(): Promise<void>;
}
