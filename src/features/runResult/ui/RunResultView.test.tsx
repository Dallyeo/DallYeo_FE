import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RunResultView } from './RunResultView';
import { useRunResultStore } from '@/features/runResult/model/runResultStore';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import type { RunResult } from '@/domain/types';
import { bridgeService } from '@/shared/services/BridgeService';
import { BridgeError } from '@/shared/bridge';
import { useToastStore } from '@/shared/ui/toastStore';

// jsdom은 래스터라이즈를 못 한다 — 캡처는 고정 data URL로 대체하고
// "무엇을 찍어 어디로 넘기는가"만 검증한다(실제 픽셀은 브라우저에서 확인).
const captureSpy = vi.hoisted(() =>
  vi.fn(async (_node: HTMLElement, _options?: unknown) => 'data:image/png;base64,AAA'),
);
vi.mock('@/shared/ui/captureElement', () => ({
  captureElementToPng: captureSpy,
  measureCaptureBox: () => ({ width: 100, height: 100 }),
  prewarmCapture: () => undefined,
}));

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

  it('결과 렌더: 거리 + 구간 · 완주율 문구는 시안에 없어 미노출', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.getByTestId('run-distance')).toHaveTextContent('10.23km');
    // 시안(V10_결과 785:2701/2793)에 완주율 메시지 자리가 없음 — 도메인 로직/테스트는 유지, 화면 노출만 제거
    expect(screen.queryByTestId('completion-message')).not.toBeInTheDocument();
  });

  it('「주변 둘러보기」 → 모달 오픈 (스크롤 아님)', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.queryByTestId('nearby-places-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('open-nearby'));
    expect(screen.getByTestId('nearby-places-modal')).toBeInTheDocument();
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

  it('티켓 탭 → 뜯김 애니메이션 시작 (V12에서 옮겨온 연출)', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    const top = screen.getByTestId('ticket-top');
    const topPiece = top.parentElement;
    const bottomPiece = screen.getByTestId('run-stamp').closest('.ticket-piece--bottom');
    expect(topPiece).not.toHaveClass('ticket-piece--torn');
    expect(bottomPiece).not.toHaveClass('ticket-piece--torn');

    fireEvent.click(top);

    expect(topPiece).toHaveClass('ticket-piece--torn');
    expect(bottomPiece).toHaveClass('ticket-piece--torn');
    // 아랫조각이 내려온 만큼 아래 콘텐츠도 함께 내려간다
    expect(screen.getByTestId('open-nearby').parentElement).toHaveClass('ticket-follow--torn');
  });

  describe('티켓 이미지 저장/공유', () => {
    beforeEach(() => {
      useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
      useToastStore.setState({ message: null });
      captureSpy.mockClear();
    });

    it('저장: 티켓만 캡처해 네이티브 앨범 저장으로 넘기고 결과를 안내한다', async () => {
      const saveImage = vi.spyOn(bridgeService, 'saveImage').mockResolvedValue('saved');
      renderView();

      fireEvent.click(screen.getByTestId('save-image'));

      await waitFor(() => expect(saveImage).toHaveBeenCalled());
      // 캡처 대상은 두 조각을 함께 감싼 컨테이너다
      expect(captureSpy.mock.calls[0]?.[0]).toHaveClass('ticket-capture');
      expect(saveImage).toHaveBeenCalledWith(
        expect.objectContaining({
          dataUrl: 'data:image/png;base64,AAA',
          fileName: 'dallyeo-ticket-r1.png',
        }),
      );
      await waitFor(() => expect(useToastStore.getState().message).toBe('사진에 저장했어요.'));
    });

    it('저장: 사진 권한 거부 → 설정 안내', async () => {
      vi.spyOn(bridgeService, 'saveImage').mockResolvedValue('denied');
      renderView();

      fireEvent.click(screen.getByTestId('save-image'));

      await waitFor(() =>
        expect(useToastStore.getState().message).toBe(
          '사진 접근 권한이 필요해요. 설정에서 허용해주세요.',
        ),
      );
    });

    it('공유: 이미지 + 문구를 네이티브 공유 시트로 넘긴다 (죽은 링크 공유 아님)', async () => {
      const shareImage = vi.spyOn(bridgeService, 'shareImage').mockResolvedValue();
      renderView();

      fireEvent.click(screen.getByTestId('share'));

      await waitFor(() =>
        expect(shareImage).toHaveBeenCalledWith(
          expect.objectContaining({ dataUrl: 'data:image/png;base64,AAA', text: '10.23km 완주!' }),
        ),
      );
    });

    it('네이티브 미구현(타임아웃) → 업데이트 안내', async () => {
      vi.spyOn(bridgeService, 'saveImage').mockRejectedValue(new BridgeError('timeout'));
      renderView();

      fireEvent.click(screen.getByTestId('save-image'));

      await waitFor(() =>
        expect(useToastStore.getState().message).toBe('앱을 업데이트하면 사용할 수 있어요.'),
      );
    });

    it('연타해도 캡처는 한 번만 (캡처는 수백 ms 걸린다)', async () => {
      let release: (v: 'saved') => void = () => undefined;
      vi.spyOn(bridgeService, 'saveImage').mockReturnValue(
        new Promise((r) => {
          release = r;
        }),
      );
      renderView();

      const button = screen.getByTestId('save-image');
      fireEvent.click(button);
      await waitFor(() => expect(button).toBeDisabled());
      fireEvent.click(button);

      expect(captureSpy).toHaveBeenCalledTimes(1);
      release('saved');
    });
  });

  it('결과 없음: 폴백 화면', () => {
    useRunResultStore.setState({ result: null, saved: false });
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.getByTestId('run-result-empty')).toBeInTheDocument();
  });
});
