import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Gender, OnboardingProfile, PermissionStatus } from '@/domain/types';
import { isProfileComplete, isHeightInRange, isWeightInRange } from '@/domain/logic';
import { bridgeService } from '@/shared/services/BridgeService';
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
  const store = useOnboardingStore();
  const { heightRaw, weightRaw, gender } = store;

  const profile = toProfile(heightRaw, weightRaw, gender);
  const canSubmit = isProfileComplete(profile);
  const heightOutOfRange = heightRaw !== '' && !isHeightInRange(Number(heightRaw));
  const weightOutOfRange = weightRaw !== '' && !isWeightInRange(Number(weightRaw));

  const setHeight = useCallback((raw: string) => store.setHeightRaw(sanitizeMeasure(raw)), [store]);
  const setWeight = useCallback((raw: string) => store.setWeightRaw(sanitizeMeasure(raw)), [store]);

  const requestLocation = useCallback(() => bridgeService.requestPermission('location'), []);

  const complete = useCallback(async () => {
    await onboardingRepository.saveProfile(profile);
    await onboardingRepository.markCompleted();
    navigate('/main', { replace: true });
  }, [profile, navigate]);

  const skip = useCallback(async () => {
    await onboardingRepository.markCompleted();
    navigate('/main', { replace: true });
  }, [navigate]);

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
