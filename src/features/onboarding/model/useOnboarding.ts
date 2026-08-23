import { useCallback } from 'react';
import type { UserProfilePatch } from '@/domain/types';
import { useNavigate } from 'react-router-dom';
import type { Gender, OnboardingProfile, PermissionStatus } from '@/domain/types';
import { isProfileComplete, isHeightInRange, isWeightInRange } from '@/domain/logic';
import { bridgeService } from '@/shared/services/BridgeService';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { profileRepository } from '@/features/settings/api/profileRepository';
import { logger } from '@/shared/observability/logger';
import { onboardingRepository } from '@/features/onboarding/api/onboardingRepository';
import { useOnboardingStore, type OnboardingStep } from './onboardingStore';

/**
 * 입력 하드 필터(BR-U2-4): 숫자 + 소수점만, 정수부 최대 3자리, 소수 1자리까지.
 * 소수점 없으면 정수부만, 정수부가 비면(예: '.') 빈 문자열.
 */
function sanitizeMeasure(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  const intPart = (dot === -1 ? cleaned : cleaned.slice(0, dot)).slice(0, 3);
  if (intPart === '') return '';
  if (dot === -1) return intPart;
  const decPart = cleaned
    .slice(dot + 1)
    .replace(/\./g, '')
    .slice(0, 1);
  return `${intPart}.${decPart}`;
}

export interface UseOnboarding {
  step: OnboardingStep;
  heightRaw: string;
  weightRaw: string;
  gender: Gender | undefined;
  profile: OnboardingProfile;
  canSubmit: boolean;
  heightOutOfRange: boolean;
  weightOutOfRange: boolean;
  setStep: (step: OnboardingStep) => void;
  setHeight: (raw: string) => void;
  setWeight: (raw: string) => void;
  setGender: (g: Gender) => void;
  requestLocation: () => Promise<PermissionStatus>;
  complete: () => Promise<void>;
  skip: () => Promise<void>;
}

function toProfile(
  heightRaw: string,
  weightRaw: string,
  gender: Gender | undefined,
): OnboardingProfile {
  return {
    ...(heightRaw ? { heightCm: Number(heightRaw) } : {}),
    ...(weightRaw ? { weightKg: Number(weightRaw) } : {}),
    ...(gender ? { gender } : {}),
  };
}

export function useOnboarding(): UseOnboarding {
  const navigate = useNavigate();
  const isLoggedIn = useSessionStore((st) => st.status) === 'authenticated';
  const store = useOnboardingStore();
  const { heightRaw, weightRaw, gender } = store;

  const profile = toProfile(heightRaw, weightRaw, gender);
  const canSubmit = isProfileComplete(profile);
  const heightOutOfRange = heightRaw !== '' && !isHeightInRange(Number(heightRaw));
  const weightOutOfRange = weightRaw !== '' && !isWeightInRange(Number(weightRaw));

  const setHeight = useCallback((raw: string) => store.setHeightRaw(sanitizeMeasure(raw)), [store]);
  const setWeight = useCallback((raw: string) => store.setWeightRaw(sanitizeMeasure(raw)), [store]);

  const requestLocation = useCallback(() => bridgeService.requestPermission('location'), []);

  /**
   * 온보딩 신체정보는 **백엔드 프로필과 같은 자리**다(backend-api.md §6.2:
   * "온보딩 신체정보 입력과 설정 수정을 겸합니다 … 호출 시 온보딩 완료로 처리").
   * 여기서 PATCH 하지 않으면 설정 > 내정보 수정이 계속 비어 보인다.
   * 게스트(비로그인)는 토큰이 없어 401이 나므로 로컬 저장만 한다.
   */
  const syncToServer = useCallback(
    async (body: UserProfilePatch) => {
      if (!isLoggedIn) return;
      try {
        await profileRepository.update(body);
      } catch (e) {
        // 저장 실패로 온보딩을 막지는 않는다 — 설정에서 다시 입력할 수 있다
        logger.error('[onboarding] 프로필 서버 저장 실패', { cause: String(e) });
      }
    },
    [isLoggedIn],
  );

  const complete = useCallback(async () => {
    await onboardingRepository.saveProfile(profile);
    await onboardingRepository.markCompleted();
    await syncToServer({
      ...(profile.heightCm !== undefined ? { heightCm: profile.heightCm } : {}),
      ...(profile.weightKg !== undefined ? { weightKg: profile.weightKg } : {}),
      ...(profile.gender ? { gender: profile.gender } : {}),
    });
    navigate('/main', { replace: true });
  }, [profile, navigate, syncToServer]);

  const skip = useCallback(async () => {
    await onboardingRepository.markCompleted();
    // 빈 바디 = 신체정보 유지 + 온보딩만 완료 처리(§6.2)
    await syncToServer({});
    navigate('/main', { replace: true });
  }, [navigate, syncToServer]);

  return {
    step: store.step,
    heightRaw,
    weightRaw,
    gender,
    profile,
    canSubmit,
    heightOutOfRange,
    weightOutOfRange,
    setStep: store.setStep,
    setHeight,
    setWeight,
    setGender: store.setGender,
    requestLocation,
    complete,
    skip,
  };
}
