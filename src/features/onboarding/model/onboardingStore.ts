import { create } from 'zustand';
import type { Gender } from '@/domain/types';

export type OnboardingStep = 'intro' | 'permission' | 'bodyInfo';

interface OnboardingUiState {
  step: OnboardingStep;
  /** 입력 raw 문자열(하드 필터 적용된 값) */
  heightRaw: string;
  weightRaw: string;
  gender: Gender | undefined;
  setStep: (step: OnboardingStep) => void;
  setHeightRaw: (v: string) => void;
  setWeightRaw: (v: string) => void;
  setGender: (g: Gender) => void;
  reset: () => void;
}

const initial = {
  step: 'intro' as OnboardingStep,
  heightRaw: '',
  weightRaw: '',
  gender: undefined as Gender | undefined,
};

export const useOnboardingStore = create<OnboardingUiState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setHeightRaw: (heightRaw) => set({ heightRaw }),
  setWeightRaw: (weightRaw) => set({ weightRaw }),
  setGender: (gender) => set({ gender }),
  reset: () => set({ ...initial }),
}));
