import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordDetailView } from './RecordDetailView';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { bridgeService } from '@/shared/services/BridgeService';
import { useToastStore } from '@/shared/ui/toastStore';

// jsdom은 래스터라이즈를 못 한다 — 캡처 결과는 고정 data URL로 대체 (V10 테스트와 동일)
const captureSpy = vi.hoisted(() =>
  vi.fn(async (_node: HTMLElement, _options?: unknown) => 'data:image/png;base64,BBB'),
);
vi.mock('@/shared/ui/captureElement', () => ({
  captureElementToPng: captureSpy,
  measureCaptureBox: () => ({ width: 100, height: 100 }),
  prewarmCapture: () => undefined,
}));

function runDto(id: string, finishedAt: string) {
  return {
    id,
    courseName: '테스트 코스',
    distanceMeters: 10230,
    durationSeconds: 1930,
    averagePaceSeconds: 193,
    calories: 250,
    finishedAt,
    completionRate: 100,
    polyline: [{ lat: 35.9, lng: 126.7 }],
    staticMapImageUrl: 'https://example.com/m.png',
  };
}

/** 최신순 목록 — rec1(최신) · rec2 · rec3(과거) */
const list = [
  runDto('rec1', '2026-06-12T09:00:00Z'),
  runDto('rec2', '2026-06-10T09:00:00Z'),
  runDto('rec3', '2026-06-08T09:00:00Z'),
];

/** 현재 경로를 노출해 스와이프 이동을 확인한다 */
function LocationProbe() {
  const location = useLocation();
  return <span data-testid="path">{location.pathname}</span>;
}

function renderDetail(startId = 'rec2') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/records/${startId}`]}>
        <LocationProbe />
        <Routes>
          <Route path="/records/:recordId" element={<RecordDetailView />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** jsdom TouchEvent는 clientX를 안 채워주므로 터치 목록을 직접 넘긴다 */
function touch(x: number, y = 300) {
  return { touches: [{ clientX: x, clientY: y }] };
}

function swipe(from: number, to: number): void {
  const target = screen.getByTestId('record-swipe');
  fireEvent.touchStart(target, touch(from));
  fireEvent.touchMove(target, touch(to));
  fireEvent.touchEnd(target, { touches: [] });
}

describe('RecordDetailView (V12)', () => {
  beforeEach(() => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const match = /\/runs\/([^?]+)/.exec(url);
        const body = match ? list.find((r) => r.id === match[1]) : list;
        return { status: 200, ok: true, json: async () => body } as Response;
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('상세 렌더: 거리 표시', async () => {
    renderDetail();
    expect(await screen.findByTestId('record-distance')).toHaveTextContent('10.23km');
  });

  it('티켓은 처음부터 뜯긴 상태로 고정 — 뜯기 애니메이션/탭 없음', async () => {
    renderDetail();
    const top = await screen.findByTestId('ticket-top');
    const piece = top.parentElement;
    expect(piece).toHaveClass('ticket-piece--settled');
    expect(piece).not.toHaveClass('ticket-piece--torn');
    // 더 이상 누를 수 있는 요소가 아니다 (V10으로 옮겨감)
    expect(top.tagName).toBe('DIV');
  });

  it('왼쪽으로 스와이프 → 다음(과거) 기록', async () => {
    renderDetail('rec2');
    await screen.findByTestId('record-distance');
    swipe(200, 100);
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/records/rec3'));
  });

  it('오른쪽으로 스와이프 → 이전(최근) 기록', async () => {
    renderDetail('rec2');
    await screen.findByTestId('record-distance');
    swipe(200, 300);
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/records/rec1'));
  });

  it('목록 끝에서는 넘어가지 않는다', async () => {
    renderDetail('rec1');
    await screen.findByTestId('record-distance');
    swipe(200, 300); // rec1보다 최근 기록은 없음
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/records/rec1'));
  });

  it('앱바에는 뒤로가기만 둔다 — 기록 넘기기는 스와이프 전용', async () => {
    renderDetail('rec2');
    await screen.findByTestId('record-distance');
    expect(screen.queryByTestId('record-detail-next')).not.toBeInTheDocument();
  });

  it('이웃 기록을 트랙에 미리 그려둔다 — 손끝을 따라 옆 티켓이 밀려 들어오도록', async () => {
    renderDetail('rec2');
    await screen.findByTestId('record-distance');
    // [rec1 · rec2 · rec3] 세 장, 현재(rec2)는 가운데 → 트랙이 한 칸 밀려 있다
    await waitFor(() => expect(screen.getByTestId('record-track').children).toHaveLength(3));
    expect(screen.getByTestId('record-track')).toHaveStyle({
      transform: 'translate3d(calc(-100% + 0px), 0, 0)',
    });
    // 화면에 보이는 한 장만 testid를 갖는다(같은 티켓이 세 벌 잡히지 않게)
    expect(screen.getAllByTestId('record-distance')).toHaveLength(1);
  });

  it('가장 최근 기록이면 앞 장이 없다 — 트랙은 밀리지 않은 상태에서 시작', async () => {
    renderDetail('rec1');
    await screen.findByTestId('record-distance');
    await waitFor(() => expect(screen.getByTestId('record-track').children).toHaveLength(2));
    expect(screen.getByTestId('record-track')).toHaveStyle({
      transform: 'translate3d(calc(0% + 0px), 0, 0)',
    });
  });

  it('완주 스탬프는 새 시안에서 빠졌다', async () => {
    renderDetail();
    await screen.findByTestId('record-distance');
    expect(screen.queryByTestId('record-stamp')).not.toBeInTheDocument();
  });

  it('좌측 엣지에서 시작한 스와이프는 무시 — iOS 뒤로가기 제스처를 뺏지 않는다', async () => {
    renderDetail('rec2');
    await screen.findByTestId('record-distance');
    swipe(10, 200);
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/records/rec2'));
  });

  describe('티켓 이미지 저장/공유 (V10과 동일 경로)', () => {
    beforeEach(() => {
      useToastStore.setState({ message: null });
      captureSpy.mockClear();
    });

    it('저장: 두 조각을 함께 캡처해 네이티브 앨범 저장으로 넘긴다', async () => {
      const saveImage = vi.spyOn(bridgeService, 'saveImage').mockResolvedValue('saved');
      renderDetail('rec2');
      await screen.findByTestId('record-distance');

      fireEvent.click(screen.getByTestId('record-save-image'));

      await waitFor(() => expect(saveImage).toHaveBeenCalled());
      expect(captureSpy.mock.calls[0]?.[0]).toHaveClass('ticket-capture');
      expect(saveImage).toHaveBeenCalledWith(
        expect.objectContaining({
          dataUrl: 'data:image/png;base64,BBB',
          fileName: 'dallyeo-ticket-rec2.png',
        }),
      );
      await waitFor(() => expect(useToastStore.getState().message).toBe('사진에 저장했어요.'));
    });

    it('공유: 이미지 + 문구를 네이티브 공유 시트로 넘긴다', async () => {
      const shareImage = vi.spyOn(bridgeService, 'shareImage').mockResolvedValue();
      renderDetail('rec2');
      await screen.findByTestId('record-distance');

      fireEvent.click(screen.getByTestId('record-share'));

      await waitFor(() =>
        expect(shareImage).toHaveBeenCalledWith(
          expect.objectContaining({ dataUrl: 'data:image/png;base64,BBB', text: '10.23km 완주!' }),
        ),
      );
    });
  });

  it('세로가 우세한 움직임은 스크롤로 넘긴다', async () => {
    renderDetail('rec2');
    await screen.findByTestId('record-distance');
    const target = screen.getByTestId('record-swipe');
    fireEvent.touchStart(target, touch(200, 300));
    fireEvent.touchMove(target, { touches: [{ clientX: 120, clientY: 500 }] });
    fireEvent.touchEnd(target, { touches: [] });
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/records/rec2'));
  });
});
