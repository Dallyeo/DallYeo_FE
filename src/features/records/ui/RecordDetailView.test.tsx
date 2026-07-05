import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordDetailView } from './RecordDetailView';
import type { RunRecordDetail } from '@/domain/types';

const detail: RunRecordDetail = {
  id: 'rec2',
  completedAt: '2026-06-06T08:30:00Z',
  distanceKm: 10.23,
  durationSec: 5064,
  avgPaceSecPerKm: 495,
  calories: 200,
  completionRate: 100,
  routePolyline: [],
  staticMapImageUrl: 'https://example.com/map.png',
};

function renderDetail() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/records/rec2']}>
        <Routes>
          <Route path="/records/:recordId" element={<RecordDetailView />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RecordDetailView (V12)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => detail } as Response),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('상세 렌더: 거리 표시', async () => {
    renderDetail();
    expect(await screen.findByTestId('record-distance')).toHaveTextContent('10.23km');
  });
});
