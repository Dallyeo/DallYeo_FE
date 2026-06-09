import type { OnboardingRepository } from '@/domain/repositories';
import type { OnboardingProfile, OnboardingState } from '@/domain/types';

const COMPLETED_KEY = 'dallyeo.onboarding.completed';
const PROFILE_KEY = 'dallyeo.onboarding.profile';

/** localStorage 안전 접근 (U2-P1, NFR-U2-REL-01) */
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장 실패는 비차단(프라이빗 모드 등)
  }
}

/** 동기 헬퍼 — 라우팅 가드용(BR-U2-1) */
export function readOnboardingCompleted(): boolean {
  return safeGet(COMPLETED_KEY) === 'true';
}

function readProfile(): OnboardingProfile | undefined {
  const raw = safeGet(PROFILE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return undefined;
  }
}

export const onboardingRepository: OnboardingRepository = {
  getState(): Promise<OnboardingState> {
    const completed = readOnboardingCompleted();
    const profile = readProfile();
    return Promise.resolve(profile ? { completed, profile } : { completed });
  },
  saveProfile(profile: OnboardingProfile): Promise<void> {
    safeSet(PROFILE_KEY, JSON.stringify(profile));
    return Promise.resolve();
  },
  markCompleted(): Promise<void> {
    safeSet(COMPLETED_KEY, 'true');
    return Promise.resolve();
  },
};
