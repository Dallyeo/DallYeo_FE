import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AchievementsView } from './AchievementsView';
import { useSessionStore } from '@/shared/auth/sessionStore';

/**
 * 백엔드 §8.1 응답 형태 — 군산 2 / 전주 1 / 활동(COMMON) 1.
 * `PIONEER`는 코드에 지역 접두사가 없고, `JEONJU_*`가 아닌데도 COMMON인 경우를 함께 덮는다.
 */
const rows = [
  {
    code: 'GUNSAN_SEONYUDO',
    category: 'GUNSAN',
    sortOrder: 10,
    name: '선유도 짱',
    description: '군산의 선유도 해변 코스를 완주했다.',
    iconOnUrl: '/images/achievements/gunsan_seonyudo_on.webp',
    iconOffUrl: '/images/achievements/gunsan_seonyudo_off.webp',
    unlocked: true,
    unlockedAt: '2026-06-12T09:00:00Z',
  },
  {
    code: 'JJAMPPONG',
    category: 'GUNSAN',
    sortOrder: 30,
    name: '짬뽕을 먹을 자격이 있는 자',
    description: '군산의 짬뽕거리 코스를 완주했다.',
    iconOnUrl: '/images/achievements/jjamppong_on.webp',
    iconOffUrl: '/images/achievements/jjamppong_off.webp',
    unlocked: false,
    unlockedAt: null,
  },
  {
    code: 'JEONJU_BEGINNER',
    category: 'JEONJU',
    sortOrder: 80,
    name: '전주 초보 러너',
    description: '전주의 러닝코스를 즐겨봤다.',
    iconOnUrl: '/images/achievements/jeonju_beginner_on.webp',
    iconOffUrl: '/images/achievements/jeonju_beginner_off.webp',
    unlocked: true,
    unlockedAt: '2026-07-20T08:30:00Z',
  },
  {
    code: 'PIONEER',
    category: 'COMMON',
    sortOrder: 210,
    name: '개척자',
    description: '새로운 코스를 만들어 런트립',
    iconOnUrl: '/images/achievements/pioneer_on.webp',
    iconOffUrl: '/images/achievements/pioneer_off.webp',
    unlocked: false,
    unlockedAt: null,
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

describe('AchievementsView (V14 — 배지 그리드)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => rows } as Response),
    );
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('탭은 군산/전주/활동 3종이고 기본은 군산 (시안 V14_업적_1~3)', async () => {
    renderView();
    expect(screen.getByTestId('achievement-tab-GUNSAN')).toHaveTextContent('군산');
    expect(screen.getByTestId('achievement-tab-JEONJU')).toHaveTextContent('전주');
    // COMMON은 지역 무관이라 화면 이름이 "활동"이다
    expect(screen.getByTestId('achievement-tab-COMMON')).toHaveTextContent('활동');
    expect(screen.getByTestId('achievement-tab-GUNSAN')).toHaveAttribute('aria-selected', 'true');
  });

  it('선택한 분류의 업적만 그리드에 보여준다', async () => {
    renderView();
    expect(await screen.findByTestId('achievement-GUNSAN_SEONYUDO')).toBeInTheDocument();
    expect(screen.getByTestId('achievement-JJAMPPONG')).toBeInTheDocument();
    expect(screen.queryByTestId('achievement-JEONJU_BEGINNER')).not.toBeInTheDocument();
    expect(screen.queryByTestId('achievement-PIONEER')).not.toBeInTheDocument();
  });

  /*
   * 명세 §8: "COMMON은 지역 무관이라 코드 접두사로 지역을 판정하면 안 된다."
   * `PIONEER`는 접두사가 없어 예전 판정(`regionOfAchievement`)에서는 군산으로 샜다.
   */
  it('활동 탭 — 코드 접두사가 아니라 category로 나눈다 (PIONEER가 군산에 새지 않는다)', async () => {
    renderView();
    await screen.findByTestId('achievement-GUNSAN_SEONYUDO');

    fireEvent.click(screen.getByTestId('achievement-tab-COMMON'));

    expect(await screen.findByTestId('achievement-PIONEER')).toBeInTheDocument();
    expect(screen.queryByTestId('achievement-GUNSAN_SEONYUDO')).not.toBeInTheDocument();
  });

  it('전주 탭으로 전환하면 전주 업적만 남는다', async () => {
    renderView();
    await screen.findByTestId('achievement-GUNSAN_SEONYUDO');

    fireEvent.click(screen.getByTestId('achievement-tab-JEONJU'));

    expect(await screen.findByTestId('achievement-JEONJU_BEGINNER')).toBeInTheDocument();
    expect(screen.queryByTestId('achievement-JJAMPPONG')).not.toBeInTheDocument();
  });

  /** 획득/미획득은 CSS 필터가 아니라 **백엔드가 준 두 이미지**를 바꿔 끼워 표현한다(§8) */
  it('획득은 컬러(iconOnUrl), 미획득은 흑백(iconOffUrl) 배지를 쓴다', async () => {
    renderView();
    const unlocked = await screen.findByTestId('achievement-GUNSAN_SEONYUDO-icon');
    const locked = screen.getByTestId('achievement-JJAMPPONG-icon');

    expect(unlocked.getAttribute('src')).toMatch(/gunsan_seonyudo_on\.webp$/);
    expect(locked.getAttribute('src')).toMatch(/jjamppong_off\.webp$/);
  });

  /*
   * 시안 `Section 4`(Frame 390~392)는 미획득 카드를 따로 그려 뒀다 —
   * 글자 opacity 0.5 + 배지 그림자 없음(그래서 이름이 4px 위로 붙는다).
   */
  it('미획득 카드는 글자가 흐리고 배지 그림자가 없다 (시안 Section 4)', async () => {
    renderView();
    await screen.findByTestId('achievement-GUNSAN_SEONYUDO');

    const lockedLabel = screen.getByTestId('achievement-JJAMPPONG-label');
    const unlockedLabel = screen.getByTestId('achievement-GUNSAN_SEONYUDO-label');
    expect(lockedLabel).toHaveClass('opacity-50');
    expect(unlockedLabel).not.toHaveClass('opacity-50');

    const lockedIcon = screen.getByTestId('achievement-JJAMPPONG-icon');
    const unlockedIcon = screen.getByTestId('achievement-GUNSAN_SEONYUDO-icon');
    expect(unlockedIcon.className).toContain('drop-shadow');
    expect(lockedIcon.className).not.toContain('drop-shadow');
    // 그림자가 빠진 만큼 이름이 배지에 바로 붙는다
    expect(unlockedLabel).toHaveClass('mt-1');
    expect(lockedLabel).not.toHaveClass('mt-1');
  });

  it('비로그인: 조회하지 않고 로그인 안내를 띄운다', async () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();

    expect(screen.getByTestId('achievements-login-gate')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.some((c) =>
          String(c[0]).includes('/achievements'),
        ),
      ).toBe(false),
    );
  });
});
