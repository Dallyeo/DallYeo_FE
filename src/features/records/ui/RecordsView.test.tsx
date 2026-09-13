import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordsView } from './RecordsView';
import { useSessionStore } from '@/shared/auth/sessionStore';

function runDto(id: string, finishedAt: string, distanceMeters = 10000) {
  return {
    id,
    courseName: '테스트 코스',
    distanceMeters,
    durationSeconds: 1930,
    calories: 250,
    finishedAt,
  };
}

/** 백엔드 목록 응답(backend-api.md §7.2) 형태. 기간 필터가 걸리므로 **오늘 기준**으로 만든다. */
const today = new Date();
const hoursAgo = (h: number) => new Date(today.getTime() - h * 3600_000).toISOString();
/** 일부러 **뒤섞은** 순서로 내려준다 — 프론트 정렬이 도는지 보려면 정렬된 응답으론 확인이 안 된다 */
const records = [
  runDto('rec-old', hoursAgo(5)),
  runDto('rec-new', hoursAgo(1)),
  runDto('rec-mid', hoursAgo(3)),
];

function renderView() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <RecordsView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** jsdom TouchEvent는 clientX를 안 채워주므로 터치 목록을 직접 넘긴다 */
const touch = (x: number, y = 300) => ({ touches: [{ clientX: x, clientY: y }] });

function swipe(from: number, to: number): void {
  const target = screen.getByTestId('records-swipe');
  fireEvent.touchStart(target, touch(from));
  fireEvent.touchMove(target, touch(to));
  fireEvent.touchEnd(target, { touches: [] });
}

describe('RecordsView (V11)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => records } as Response),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('비로그인: 로그인 게이트(배너) 노출, 리스트 없음', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    expect(screen.getByTestId('records-login-gate')).toBeInTheDocument();
    expect(screen.getByTestId('login-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('record-card-rec-new')).not.toBeInTheDocument();
  });

  describe('로그인', () => {
    beforeEach(() => {
      useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    });

    it('기록 카드 렌더', async () => {
      renderView();
      expect(await screen.findByTestId('record-card-rec-new')).toBeInTheDocument();
    });

    it('목록은 최신순(내림차순) — 응답 순서와 무관', async () => {
      renderView();
      await screen.findByTestId('record-card-rec-new');
      const ids = screen
        .getAllByTestId(/^record-card-/)
        .map((el) => el.getAttribute('data-testid'));
      expect(ids).toEqual(['record-card-rec-new', 'record-card-rec-mid', 'record-card-rec-old']);
    });

    it('왼쪽 스와이프 → 주간에서 월간으로, 한 번 더 하면 연간', async () => {
      renderView();
      await screen.findByTestId('record-card-rec-new');
      expect(screen.getByTestId('period-weekly')).toHaveAttribute('aria-selected', 'true');

      swipe(200, 100);
      await waitFor(() =>
        expect(screen.getByTestId('period-monthly')).toHaveAttribute('aria-selected', 'true'),
      );

      swipe(200, 100);
      await waitFor(() =>
        expect(screen.getByTestId('period-yearly')).toHaveAttribute('aria-selected', 'true'),
      );
    });

    it('오른쪽 스와이프 → 이전 기간으로, 첫 탭에서는 넘어가지 않는다', async () => {
      renderView();
      await screen.findByTestId('record-card-rec-new');
      fireEvent.click(screen.getByTestId('period-monthly'));

      swipe(200, 300);
      await waitFor(() =>
        expect(screen.getByTestId('period-weekly')).toHaveAttribute('aria-selected', 'true'),
      );

      swipe(200, 300); // 주간이 첫 탭 → 그대로
      await waitFor(() =>
        expect(screen.getByTestId('period-weekly')).toHaveAttribute('aria-selected', 'true'),
      );
    });

    it('좌측 엣지에서 시작한 스와이프는 무시 — iOS 뒤로가기 제스처를 뺏지 않는다', async () => {
      renderView();
      await screen.findByTestId('record-card-rec-new');
      swipe(10, 200);
      await waitFor(() =>
        expect(screen.getByTestId('period-weekly')).toHaveAttribute('aria-selected', 'true'),
      );
    });

    it('화살표로 기간 이동 — 이전은 항상 가능, 다음(미래)은 현재 구간에서 비활성', async () => {
      renderView();
      await screen.findByTestId('record-card-rec-new');
      const label = screen.getByTestId('period-nav-label');
      const first = label.textContent;

      expect(screen.getByTestId('period-next')).toBeDisabled();

      fireEvent.click(screen.getByTestId('period-prev'));
      await waitFor(() => expect(label.textContent).not.toBe(first));
      expect(screen.getByTestId('period-next')).toBeEnabled();

      fireEvent.click(screen.getByTestId('period-next'));
      await waitFor(() => expect(label.textContent).toBe(first));
      expect(screen.getByTestId('period-next')).toBeDisabled();
    });

    it('기간 라벨은 단위에 맞게 바뀐다 (주간 범위 / 월간 / 연간)', async () => {
      renderView();
      await screen.findByTestId('record-card-rec-new');
      const label = screen.getByTestId('period-nav-label');
      expect(label).toHaveTextContent(/^\d{4}년 \d{1,2}월 \d{1,2}일 ~ /);

      fireEvent.click(screen.getByTestId('period-monthly'));
      await waitFor(() => expect(label).toHaveTextContent(/^\d{4}년 \d{1,2}월$/));

      fireEvent.click(screen.getByTestId('period-yearly'));
      await waitFor(() => expect(label).toHaveTextContent(/^\d{4}년$/));
    });

    it('기간 단위를 바꾸면 구간이 현재로 되돌아간다', async () => {
      renderView();
      await screen.findByTestId('record-card-rec-new');
      fireEvent.click(screen.getByTestId('period-prev'));
      await waitFor(() => expect(screen.getByTestId('period-next')).toBeEnabled());

      fireEvent.click(screen.getByTestId('period-monthly'));
      await waitFor(() => expect(screen.getByTestId('period-next')).toBeDisabled());
    });

    it('탭마다 대응하는 차트가 렌더된다', async () => {
      renderView();
      await screen.findByTestId('record-card-rec-new');
      const track = screen.getByTestId('chart-track');
      expect(within(track).getByTestId('weekly-chart')).toBeInTheDocument();
      expect(within(track).getByTestId('monthly-chart')).toBeInTheDocument();
      expect(within(track).getByTestId('yearly-chart')).toBeInTheDocument();
    });
  });
});
