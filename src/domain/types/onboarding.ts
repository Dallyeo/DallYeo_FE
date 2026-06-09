/**
 * 온보딩 도메인 타입 (FR-V01)
 */

/** 성별 4옵션 (FR-V01-07). 'unspecified' = 선택안함(명시적 선택으로 간주, FD Q3) */
export type Gender = 'male' | 'female' | 'other' | 'unspecified';

/** 온보딩 신체 정보. 모두 선택(건너뛰기 가능) */
export interface OnboardingProfile {
  /** 키(cm), 정수 */
  heightCm?: number;
  /** 체중(kg), 정수 */
  weightKg?: number;
  gender?: Gender;
}

/** 온보딩 진행 상태. completed = 완료 또는 건너뛰기 (FR-V01-01/08) */
export interface OnboardingState {
  completed: boolean;
  profile?: OnboardingProfile;
}
