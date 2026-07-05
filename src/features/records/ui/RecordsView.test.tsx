import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordsView } from './RecordsView';
import { useSessionStore } from '@/shared/auth/sessionStore';
import type { RunRecord } from '@/domain/types';

const records: RunRecord[] = [
  {
    id: 'rec1',
    completedAt: '2026-06-10T09:00:00Z',
    distanceKm: 10,
    durationSec: 1930,
    avgPaceSecPerKm: 193,
    calories: 250,
  },
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
    expect(screen.queryByTestId('record-card-rec1')).not.toBeInTheDocument();
  });

  it('로그인: 기록 카드 렌더', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(await screen.findByTestId('record-card-rec1')).toBeInTheDocument();
  });
});
