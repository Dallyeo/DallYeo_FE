import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RunResultView } from './RunResultView';
import { useRunResultStore } from '@/features/runResult/model/runResultStore';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import type { RunResult } from '@/domain/types';

const result: RunResult = {
  runId: 'r1',
  distanceKm: 10.23,
  durationSec: 3661,
  avgPaceSecPerKm: 495,
  calories: 200,
  completionRate: 100,
  routePolyline: [],
  staticMapImageUrl: 'https://example.com/map.png',
  endLocation: { lat: 35.9, lng: 126.7 },
  completedAt: '2026-07-05T00:00:00Z',
};

function renderView() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <RunResultView />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RunResultView (V10)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => [] } as Response),
    );
    useLoginSheetStore.setState({ isOpen: false, pendingAction: null });
    useRunResultStore.setState({ result, saved: false });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('결과 렌더: 거리 + 완주율 문구(100%)', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.getByTestId('run-distance')).toHaveTextContent('10.23km');
    expect(screen.getByTestId('completion-message')).toHaveTextContent('완주에 성공했어요');
  });

  it('비로그인: 메인화면 → 이탈 확인 팝업, 로그인 클릭 시 로그인 시트 오픈(saveRunResult)', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    fireEvent.click(screen.getByTestId('go-main'));
    expect(screen.getByTestId('leave-confirm-dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('leave-login'));
    expect(useLoginSheetStore.getState().isOpen).toBe(true);
    expect(useLoginSheetStore.getState().pendingAction).toBe('saveRunResult');
  });

  it('결과 없음: 폴백 화면', () => {
    useRunResultStore.setState({ result: null, saved: false });
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.getByTestId('run-result-empty')).toBeInTheDocument();
  });
});
