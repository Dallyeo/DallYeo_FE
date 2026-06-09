import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Gender, OnboardingProfile, PermissionStatus } from '@/domain/types';
import {
  isProfileComplete,
  isHeightInRange,
  isWeightInRange,
} from '@/domain/logic';
import { bridgeService } from '@/shared/services/BridgeService';
import { onboardingRepository } from '@/features/onboarding/api/onboardingRepository';
import { useOnboardingStore, type OnboardingStep } from './onboardingStore';

/** 숫자만, 최대 3자리(하드 필터, BR-U2-4) */
function sanitizeDigits(raw: string): string {
  return raw.replace(/[^0-9]/g, '').slice(0, 3);
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

function toProfile(heightRaw: string, weightRaw: string, gender: Gender | undefined): OnboardingProfile {
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

  const setHeight = useCallback((raw: string) => store.setHeightRaw(sanitizeDigits(raw)), [store]);
  const setWeight = useCallback((raw: string) => store.setWeightRaw(sanitizeDigits(raw)), [store]);

  const requestLocation = useCallback(
    () => bridgeService.requestPermission('location'),
    [],
  );

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
