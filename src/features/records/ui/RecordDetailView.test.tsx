import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordDetailView } from './RecordDetailView';

const detail = {
  id: 'rec1',
  courseName: '테스트 코스',
  distanceMeters: 10230,
  durationSeconds: 1930,
  averagePaceSeconds: 193,
  calories: 250,
  finishedAt: '2026-06-10T09:00:00Z',
  completionRate: 100,
  polyline: [{ lat: 35.9, lng: 126.7 }],
  staticMapImageUrl: 'https://example.com/m.png',
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
