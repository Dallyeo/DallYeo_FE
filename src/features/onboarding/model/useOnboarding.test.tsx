import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { apiClient } from '@/shared/api/apiClient';
import { useOnboarding } from './useOnboarding';
import { useOnboardingStore } from './onboardingStore';

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useOnboarding (V01-S2/S3)', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
    window.localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', session: null });
  });
  afterEach(() => vi.unstubAllGlobals());

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

  // 온보딩 1단계가 로그인 화면(ServiceIntroStep)이므로, 소셜 로그인으로 들어온 사용자는
  // bodyInfo 단계에서 이미 authenticated 다 → "시작하기"가 PATCH /users/me 를 보내야 한다.
  describe('시작하기 → 서버 전송', () => {
    function stubFetch() {
      const fetchMock = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true, data: { id: 1, nickname: '달여' } }),
      } as Response);
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    }

    it('로그인 상태: PATCH /users/me 로 키·체중·성별 전송', async () => {
      const fetchMock = stubFetch();
      apiClient.setToken('t');
      useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });

      const { result } = renderHook(() => useOnboarding(), { wrapper });
      act(() => {
        result.current.setHeight('175');
        result.current.setWeight('65');
        result.current.setGender('male');
      });
      await act(async () => {
        await result.current.complete();
      });

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/users/me');
      expect(init.method).toBe('PATCH');
      expect(JSON.parse(init.body as string)).toEqual({
        height: 175,
        weight: 65,
        gender: 'MALE',
      });
      expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer t');
    });

    it('게스트: 서버 전송 없이 로컬에만 저장', async () => {
      const fetchMock = stubFetch();
      const { result } = renderHook(() => useOnboarding(), { wrapper });
      act(() => {
        result.current.setHeight('175');
        result.current.setWeight('65');
        result.current.setGender('male');
      });
      await act(async () => {
        await result.current.complete();
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});