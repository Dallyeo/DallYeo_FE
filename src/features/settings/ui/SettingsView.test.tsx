import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsView } from './SettingsView';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useToastStore } from '@/shared/ui/toastStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import { onboardingRepository } from '@/features/onboarding/api/onboardingRepository';
import { bridgeService } from '@/shared/services/BridgeService';
import type { UserProfile } from '@/domain/types';

const profile: UserProfile = { nickname: '카야', heightCm: 167.5, weightKg: 55, gender: 'unspecified' };

function renderView() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SettingsView (V13)', () => {
  beforeEach(() => {
    useLoginSheetStore.setState({ isOpen: false, pendingAction: null });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => profile } as Response),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  // 시안(V13_설정 618:1110)에는 프로필 카드·로그인 배너가 없다 — 메뉴만 노출하고
  // 비로그인 처리는 항목 탭 시 게이트(로그인 시트)로 한다.
  it('비로그인: 배너/프로필 카드 없이 메뉴만 노출', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    expect(screen.queryByTestId('login-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('settings-edit-info')).toBeInTheDocument();
  });

  it('비로그인: 내정보수정 탭 시 로그인 시트(이동 X)', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    screen.getByTestId('settings-edit-info').click();
    expect(useLoginSheetStore.getState().isOpen).toBe(true);
  });

  // 시안(V13_설정 618:1110)에 프로필 카드가 없다 — 메뉴만 노출된다.
  it('시안 메뉴 구성: 로그아웃 · 계정 삭제 노출', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.getByTestId('settings-logout')).toHaveTextContent('로그아웃');
    expect(screen.getByTestId('settings-account')).toHaveTextContent('계정 삭제');
  });

  describe('계정 삭제', () => {
    beforeEach(async () => {
      window.localStorage.clear();
      await onboardingRepository.saveProfile({ heightCm: 175 });
      await onboardingRepository.markCompleted();
      useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    });

    async function confirmDelete() {
      renderView();
      fireEvent.click(screen.getByTestId('settings-account'));
      fireEvent.click(screen.getByTestId('delete-account-alert-confirm'));
      await waitFor(() => expect(useToastStore.getState().message).toBe('계정이 삭제되었어요.'));
    }

    it('DELETE 성공 → 온보딩 기록 삭제 + 세션 파기', async () => {
      await confirmDelete();
      const state = await onboardingRepository.getState();
      expect(state.completed).toBe(false);
      expect(state.profile).toBeUndefined();
      expect(useSessionStore.getState().status).toBe('unauthenticated');
    });

    // 되돌릴 수 없는 연산이 끝난 뒤의 정리 실패는 흐름을 막지 않는다
    it('브릿지 로그아웃이 실패해도 탈퇴 흐름은 완료된다', async () => {
      vi.spyOn(bridgeService, 'logout').mockRejectedValue(new Error('bridge down'));
      await confirmDelete();
      expect(useSessionStore.getState().status).toBe('unauthenticated');
      expect(await onboardingRepository.getState()).toEqual({ completed: false });
    });

    it('DELETE 실패 → 삭제 실패 안내 + 온보딩 기록 유지', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ status: 500, ok: false, json: async () => ({}) } as Response),
      );
      renderView();
      fireEvent.click(screen.getByTestId('settings-account'));
      fireEvent.click(screen.getByTestId('delete-account-alert-confirm'));
      await waitFor(() => expect(useToastStore.getState().message).not.toBe(null));
      expect(useToastStore.getState().message).not.toBe('계정이 삭제되었어요.');
      expect(await onboardingRepository.getState()).toMatchObject({ completed: true });
      expect(useSessionStore.getState().status).toBe('authenticated');
    });
  });
});
