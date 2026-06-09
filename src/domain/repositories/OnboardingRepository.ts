import type { OnboardingProfile, OnboardingState } from '@/domain/types';

/** 온보딩 Repository (계약). 구현은 U2에서. */
export interface OnboardingRepository {
  getState(): Promise<OnboardingState>;
  saveProfile(profile: OnboardingProfile): Promise<void>;
  /** 완료/건너뛰기 공통 완료 플래그 */
  markCompleted(): Promise<void>;
}
