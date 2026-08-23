import { describe, it, expect, beforeEach } from 'vitest';
import { onboardingRepository, readOnboardingCompleted } from './onboardingRepository';

describe('onboardingRepository (localStorage)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('초기 상태: 미완료', async () => {
    expect(readOnboardingCompleted()).toBe(false);
    const state = await onboardingRepository.getState();
    expect(state.completed).toBe(false);
  });

  it('markCompleted 후 완료로 읽힘', async () => {
    await onboardingRepository.markCompleted();
    expect(readOnboardingCompleted()).toBe(true);
    const state = await onboardingRepository.getState();
    expect(state.completed).toBe(true);
  });

  it('saveProfile round-trip', async () => {
    await onboardingRepository.saveProfile({ heightCm: 175, weightKg: 65, gender: 'male' });
    const state = await onboardingRepository.getState();
    expect(state.profile).toEqual({ heightCm: 175, weightKg: 65, gender: 'male' });
  });

  it('reset: 완료 플래그 + 신체정보 모두 삭제 (회원탈퇴)', async () => {
    await onboardingRepository.saveProfile({ heightCm: 175, weightKg: 65, gender: 'male' });
    await onboardingRepository.markCompleted();

    await onboardingRepository.reset();

    expect(readOnboardingCompleted()).toBe(false);
    const state = await onboardingRepository.getState();
    expect(state.completed).toBe(false);
    expect(state.profile).toBeUndefined();
  });
});
