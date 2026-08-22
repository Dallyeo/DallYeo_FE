import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AchievementsView } from './AchievementsView';
import { useSessionStore } from '@/shared/auth/sessionStore';

/** 백엔드 §8.1 응답 형태 — 군산 2 / 전주 1 */
const achievements = [
  {
    code: 'GUNSAN_BEGINNER',
    name: '군산 초보 러너',
    description: '군산에서 러닝 1회 완료',
    unlocked: true,
    unlockedAt: '2026-06-12T09:00:00Z',
  },
  {
    code: 'JJAMPPONG',
    name: '짬뽕을 먹을 자격이 있는 자',
    description: '군산 짬뽕거리 코스',
    unlocked: false,
    unlockedAt: null,
  },
  {
    code: 'JEONJU_BEGINNER',
    name: '전주 초보 러너',
    description: '전주에서 러닝 1회 완료',
    unlocked: true,
    unlockedAt: '2026-07-20T08:30:00Z',
  },
];

function renderView() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AchievementsView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AchievementsView (V14)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => achievements,
      } as Response),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('비로그인: 로그인 게이트 노출, 시트 없음', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    expect(screen.getByTestId('achievements-login-gate')).toBeInTheDocument();
    expect(screen.queryByTestId('achievement-sheet')).not.toBeInTheDocument();
  });

  it('지역 탭은 군산/전주 2종이고 기본은 군산', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['군산', '전주']);
    expect(screen.getByTestId('region-GUNSAN')).toHaveAttribute('aria-selected', 'true');
  });

  it('로그인: 선택한 지역의 업적만 시트에 표시한다', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(await screen.findByTestId('achievement-GUNSAN_BEGINNER')).toBeInTheDocument();
    expect(screen.getByTestId('achievement-JJAMPPONG')).toBeInTheDocument();
    // 전주 업적은 군산 탭에서 보이지 않는다
    expect(screen.queryByTestId('achievement-JEONJU_BEGINNER')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('region-JEONJU'));
    expect(screen.getByTestId('achievement-JEONJU_BEGINNER')).toBeInTheDocument();
    expect(screen.queryByTestId('achievement-GUNSAN_BEGINNER')).not.toBeInTheDocument();
  });

  it('시트 핸들 탭 → 올림/내림 토글', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    const sheet = await screen.findByTestId('achievement-sheet');
    expect(sheet).toHaveStyle({ height: '60dvh' });

    const handle = screen.getByTestId('achievement-sheet-handle');
    fireEvent.pointerDown(handle, { clientY: 100 });
    fireEvent.pointerUp(handle, { clientY: 100 });
    expect(sheet).toHaveStyle({ height: '17dvh' });
  });
});
