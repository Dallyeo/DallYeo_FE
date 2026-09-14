import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RunResultView } from './RunResultView';
import { useRunResultStore } from '@/features/runResult/model/runResultStore';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import type { RunCompletedPayload, RunResult } from '@/domain/types';
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

/** 네이티브가 주는 건 기록 id와 도착 좌표뿐 — 내용은 `GET /runs/{id}`가 채운다 */
const payload: RunCompletedPayload = { recordId: '1', end: { lat: 35.9, lng: 126.7 } };

const result: RunResult = {
  runId: '1',
  courseName: '짬뽕런',
  distanceKm: 10.23,
  durationSec: 3661,
  avgPaceSecPerKm: 495,
  calories: 720,
  routeImageUrl: 'https://example.com/route.png',
  completedAt: '2026-07-05T00:00:00Z',
};

/** `GET /runs/{id}`만 가로채고 나머지(주변 장소)는 빈 배열 */
function stubFetch(runResult: RunResult | 'error' = result) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string | URL) => {
      if (String(url).includes('/runs/')) {
        if (runResult === 'error') {
          return { status: 500, ok: false, json: async () => ({ success: false }) } as Response;
        }
        return {
          status: 200,
          ok: true,
          json: async () => ({
            id: runResult.runId,
            courseName: runResult.courseName,
            distanceMeters: Math.round(runResult.distanceKm * 1000),
            durationSeconds: runResult.durationSec,
            averagePaceSeconds: runResult.avgPaceSecPerKm,
            ...(runResult.calories !== undefined ? { calories: runResult.calories } : {}),
            imageUrl: runResult.routeImageUrl,
            finishedAt: runResult.completedAt,
            ...(runResult.newAchievements ? { newAchievements: runResult.newAchievements } : {}),
          }),
        } as Response;
      }
      return { status: 200, ok: true, json: async () => [] } as Response;
    }),
  );
}

/** 티켓이 그려질 때까지 기다린다 — 결과는 이제 비동기로 온다 */
const ticket = () => screen.findByTestId('ticket-top');

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
    stubFetch();
    useLoginSheetStore.setState({ isOpen: false, pendingAction: null });
    useRunResultStore.setState({ payload });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('기록 id로 GET /runs/{id} 를 불러 결과를 그린다 (웹은 저장하지 않는다)', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();

    await ticket();
    expect(screen.getByTestId('run-distance')).toHaveTextContent('10.23km');
    // 지점명이 계약에서 빠져 "출발 → 도착" 자리에는 코스명이 들어간다
    expect(screen.getByTestId('run-route')).toHaveTextContent('짬뽕런');
    // 시안(V10_결과 785:2701/2793)에 완주율 메시지 자리가 없음 — 도메인 로직/테스트는 유지, 화면 노출만 제거
    expect(screen.queryByTestId('completion-message')).not.toBeInTheDocument();

    const requested = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) =>
      String(c[0]),
    );
    expect(requested.some((u) => u.includes('/runs/1'))).toBe(true);
    // ⚠️ 저장은 네이티브 소관 — 웹이 POST /runs 를 부르면 안 된다
    const methods = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.map(
      (c) => (c[1] as RequestInit | undefined)?.method,
    );
    expect(methods).not.toContain('POST');
  });

  it('칼로리는 네이티브가 보낸 값을 그대로 보여주고, 없으면 "-"로 둔다', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    const { unmount } = renderView();
    await ticket();
    expect(screen.getByTestId('run-result-view')).toHaveTextContent('720');
    unmount();

    const noCalories: RunResult = { ...result };
    delete noCalories.calories;
    stubFetch(noCalories);
    renderView();
    await ticket();
    expect(screen.getByTestId('run-result-view')).not.toHaveTextContent('720');
  });

  it('경로 이미지는 네이티브가 올린 imageUrl 을 그대로 쓴다', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    await ticket();
    expect(screen.getByTestId('route-map')).toHaveAttribute(
      'src',
      'https://example.com/route.png',
    );
  });

  it('새로 딴 업적이 오면 지도 위에 도장으로 띄운다 (시안 V10_결과_new_1 자리)', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    stubFetch({
      ...result,
      newAchievements: [
        {
          code: 'JJAMPPONG',
          category: 'GUNSAN',
          sortOrder: 30,
          name: '짬뽕을 먹을 자격이 있는 자',
          description: '짬뽕거리 코스를 완주했다.',
          unlocked: true,
          iconOnUrl: 'https://example.com/jjamppong_on.webp',
          iconOffUrl: 'https://example.com/jjamppong_off.webp',
        },
      ],
    });
    renderView();

    const stamp = await screen.findByTestId('new-achievement-JJAMPPONG');
    expect(stamp).toHaveAttribute('alt', '짬뽕을 먹을 자격이 있는 자');
    // 1개일 때는 150/330 크기로 우하단 모서리에 걸친다(Figma V10_결과_new_1 실측)
    expect(stamp.style.width).toBe(`${(150 / 330) * 100}%`);
    expect(stamp.style.right).toBe(`${(-15 / 330) * 100}%`);
    expect(stamp.style.bottom).toBe(`${(-34 / 330) * 100}%`);
    // 초록 완주 스탬프는 새 시안에서 빠졌다
    expect(screen.queryByTestId('run-stamp')).not.toBeInTheDocument();
  });

  it('도장이 브릿지 이벤트로 오면 결과창에 띄운다 (GET /runs/{id}에는 없는 값)', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    useRunResultStore.setState({
      payload: {
        ...payload,
        newAchievements: [
          {
            code: 'EARLY_BIRD',
            category: 'COMMON',
            sortOrder: 170,
            name: '얼리버드',
            description: '한국시간 08시 이전에 시작했다.',
            unlocked: true,
            iconOnUrl: 'https://example.com/early_bird_on.webp',
            iconOffUrl: 'https://example.com/early_bird_off.webp',
          },
        ],
      },
    });
    renderView();

    expect(await screen.findByTestId('new-achievement-EARLY_BIRD')).toHaveAttribute(
      'alt',
      '얼리버드',
    );
  });

  it('도장이 없으면 업적 줄 자체를 그리지 않는다', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    await ticket();
    expect(screen.queryByTestId('new-achievements')).not.toBeInTheDocument();
  });

  it('「주변 둘러보기」 → 모달 오픈 (결과를 기다리지 않는다 — 좌표는 이벤트에 있다)', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.queryByTestId('nearby-places-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('open-nearby'));
    expect(screen.getByTestId('nearby-places-modal')).toBeInTheDocument();
  });

  it('비로그인: 기록 조회를 시도하지 않고 로그인 안내만 띄운다 (저장·재시도는 네이티브 소관)', () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderView();
    expect(screen.getByTestId('run-result-login-required')).toBeInTheDocument();
    const requested = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) =>
      String(c[0]),
    );
    expect(requested.some((u) => u.includes('/runs/'))).toBe(false);
  });

  it('로그인했는데 조회할 기록 id가 없으면 스피너 대신 사유를 보여준다 (저장 실패·계약 불일치)', () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    useRunResultStore.setState({ payload: { end: { lat: 35.9, lng: 126.7 } } });
    renderView();
    expect(screen.getByTestId('run-result-no-record')).toBeInTheDocument();
    // 좌표만으로 동작하는 「주변 둘러보기」는 그대로 열려 있어야 한다
    expect(screen.getByTestId('open-nearby')).toBeInTheDocument();
    const requested = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) =>
      String(c[0]),
    );
    expect(requested.some((u) => u.includes('/runs/'))).toBe(false);
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

  it('티켓 탭 → 뜯김 애니메이션 시작 (V12에서 옮겨온 연출)', async () => {
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    const top = await ticket();
    const topPiece = top.parentElement;
    const bottomPiece = screen.getByTestId('route-map').closest('.ticket-piece--bottom');
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
      await ticket();

      fireEvent.click(screen.getByTestId('save-image'));

      await waitFor(() => expect(saveImage).toHaveBeenCalled());
      // 캡처 대상은 두 조각을 함께 감싼 컨테이너다
      expect(captureSpy.mock.calls[0]?.[0]).toHaveClass('ticket-capture');
      expect(saveImage).toHaveBeenCalledWith(
        expect.objectContaining({
          dataUrl: 'data:image/png;base64,AAA',
          fileName: 'dallyeo-ticket-1.png',
        }),
      );
      await waitFor(() => expect(useToastStore.getState().message).toBe('사진에 저장했어요.'));
    });

    it('저장: 사진 권한 거부 → 설정 안내', async () => {
      vi.spyOn(bridgeService, 'saveImage').mockResolvedValue('denied');
      renderView();
      await ticket();

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
      await ticket();

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
      await ticket();

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
      await ticket();

      const button = screen.getByTestId('save-image');
      fireEvent.click(button);
      await waitFor(() => expect(button).toBeDisabled());
      fireEvent.click(button);

      expect(captureSpy).toHaveBeenCalledTimes(1);
      release('saved');
    });
  });

  it('runCompleted 없이 직접 진입: 폴백 화면', () => {
    useRunResultStore.setState({ payload: null });
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderView();
    expect(screen.getByTestId('run-result-empty')).toBeInTheDocument();
  });
});
