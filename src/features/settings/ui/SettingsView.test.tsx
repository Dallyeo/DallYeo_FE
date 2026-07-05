import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsView } from './SettingsView';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
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

  it('비로그인: 로그인 배너 + 프로필 카드 없음', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    expect(screen.getByTestId('login-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
  });

  it('비로그인: 내정보수정 탭 시 로그인 시트(이동 X)', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    screen.getByTestId('settings-edit-info').click();
    expect(useLoginSheetStore.getState().isOpen).toBe(true);
  });

  it('로그인: 프로필 카드 렌더', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(await screen.findByTestId('profile-card')).toBeInTheDocument();
    expect(screen.getByTestId('profile-card')).toHaveTextContent('카야, 안녕하세요!');
  });
});
