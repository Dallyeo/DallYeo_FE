import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useOnboarding } from './useOnboarding';
import { useOnboardingStore } from './onboardingStore';

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useOnboarding (V01-S2/S3)', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
    window.localStorage.clear();
  });

  it('키 입력 하드 필터: 숫자만, 최대 3자리', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    act(() => result.current.setHeight('1a7x5999'));
    expect(result.current.heightRaw).toBe('175');
  });

  it('canSubmit: 키·체중·성별 모두 유효해야 true', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    expect(result.current.canSubmit).toBe(false);
    act(() => {
      result.current.setHeight('175');
      result.current.setWeight('65');
      result.current.setGender('unspecified');
    });
    expect(result.current.canSubmit).toBe(true);
  });

  it('소프트 범위 경고는 canSubmit에 영향 없음', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    act(() => {
      result.current.setHeight('999'); // 3자리 → 하드 통과, 범위 밖
      result.current.setWeight('65');
      result.current.setGender('male');
    });
    expect(result.current.heightOutOfRange).toBe(true);
    expect(result.current.canSubmit).toBe(true);
  });

  it('단계 전이', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    expect(result.current.step).toBe('intro');
    act(() => result.current.setStep('bodyInfo'));
    expect(result.current.step).toBe('bodyInfo');
  });
});
