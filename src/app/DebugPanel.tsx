import { useEffect, useState, useSyncExternalStore } from 'react';
import { emitMockBridgeEvent } from '@/shared/bridge';
import { clearLogs, getLogs, subscribeLogs, type LogEntry } from '@/shared/observability/logger';
import { env } from '@/shared/config/env';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useRunResultStore } from '@/features/runResult/model/runResultStore';

/** 이 키가 'true'면 패널 진입 버튼이 항상 보인다. 두 손가락 길게 누르기로도 켤 수 있다. */
const DEBUG_KEY = 'dallyeo.debug';
/** 두 손가락으로 이 시간 이상 누르면 토글 */
const HOLD_MS = 1200;

function readFlag(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('debug') === '1') return true;
    return window.localStorage.getItem(DEBUG_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeFlag(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(DEBUG_KEY, 'true');
    else window.localStorage.removeItem(DEBUG_KEY);
  } catch {
    // 프라이빗 모드 — 이번 세션에만 켜진다
  }
}

/**
 * 실기기(WebView) 진단 패널.
 *
 * **왜 필요한가** — 앱 안의 WebView에는 주소창도 콘솔도 없다. Mac에 USB로 연결해
 * Safari 웹 인스펙터를 붙이는 방법뿐인데, 그것도 네이티브가 `isInspectable = true`로
 * 빌드했을 때만 된다. 그래서 로그를 **화면 위에** 띄운다.
 *
 * **여는 법** — 화면 아무 데나 **두 손가락으로 1.2초 길게 누르기**(주소창이 없는 앱에서도 가능).
 * 브라우저에서는 `?debug=1`로도 열린다. 한 번 켜면 `localStorage`에 남아 재실행해도 유지된다.
 *
 * 토큰 값은 절대 표시하지 않는다(보유 여부만).
 */
export function DebugPanel() {
  const [enabled, setEnabled] = useState(readFlag);
  const [open, setOpen] = useState(false);

  // 두 손가락 길게 누르기 — 스크롤/스와이프와 겹치지 않도록 손가락이 움직이면 취소한다
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const cancel = (): void => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const onStart = (e: TouchEvent): void => {
      if (e.touches.length !== 2) return cancel();
      timer = setTimeout(() => {
        setEnabled((prev) => {
          const next = !prev;
          writeFlag(next);
          return next;
        });
        setOpen((prev) => !prev);
      }, HOLD_MS);
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', cancel, { passive: true });
    window.addEventListener('touchend', cancel, { passive: true });
    return () => {
      cancel();
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', cancel);
      window.removeEventListener('touchend', cancel);
    };
  }, []);

  if (!enabled) return null;

  return open ? (
    <DebugSheet
      onClose={() => setOpen(false)}
      onDisable={() => {
        writeFlag(false);
        setEnabled(false);
      }}
    />
  ) : (
    <button
      type="button"
      data-testid="debug-open"
      aria-label="디버그 패널 열기"
      onClick={() => setOpen(true)}
      className="fixed right-2 z-[9999] h-9 w-9 rounded-full bg-black/60 text-caption text-white"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
    >
      LOG
    </button>
  );
}

function DebugSheet({ onClose, onDisable }: { onClose: () => void; onDisable: () => void }) {
  const logs = useSyncExternalStore(subscribeLogs, getLogs);
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const runPayload = useRunResultStore((s) => s.payload);
  const [copied, setCopied] = useState(false);
  const [recordId, setRecordId] = useState('1');

  const report = [
    `# 달여 디버그 ${new Date().toISOString()}`,
    `bridge=${typeof window !== 'undefined' && !!window.DallYeoBridge}`,
    `session=${status}${session?.userId ? ` (${session.userId})` : ''}`,
    `apiBaseUrl=${env.apiBaseUrl}`,
    `publicApiBaseUrl=${env.publicApiBaseUrl}`,
    `msw=${env.enableMsw} forceMockBridge=${env.forceMockBridge}`,
    ...readViewportDiagnostics(),
    // 저장은 네이티브가 한다 — 웹이 받는 건 runId와 도착 좌표뿐이다(2026-09-14 계약 변경)
    `runCompleted=${runPayload ? `recordId=${runPayload.recordId ?? '없음(조회 불가)'} end=${runPayload.end.lat},${runPayload.end.lng}` : '없음'}`,
    '',
    ...logs.map(formatEntry),
  ].join('\n');

  async function copyAll(): Promise<void> {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      // WebView에서 클립보드가 막혀 있으면 아래 텍스트를 길게 눌러 직접 복사해야 한다
      setCopied(false);
    }
  }

  return (
    <div
      data-testid="debug-panel"
      className="fixed inset-0 z-[9999] flex flex-col bg-black/90 text-white"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex shrink-0 items-center gap-2 px-3 py-2">
        <span className="text-body">디버그</span>
        <button
          type="button"
          onClick={copyAll}
          className="rounded bg-white/15 px-2 py-1 text-caption"
        >
          {copied ? '복사됨' : '전체 복사'}
        </button>
        <button
          type="button"
          onClick={clearLogs}
          className="rounded bg-white/15 px-2 py-1 text-caption"
        >
          비우기
        </button>
        <button
          type="button"
          onClick={onDisable}
          className="rounded bg-white/15 px-2 py-1 text-caption"
        >
          끄기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded bg-white/15 px-3 py-1 text-caption"
        >
          닫기
        </button>
      </div>

      <RunCompletedTrigger recordId={recordId} onRecordIdChange={setRecordId} onFired={onClose} />

      {/* 클립보드가 막힌 WebView를 대비해 **선택 가능한 원문**을 그대로 둔다 (길게 눌러 복사 / 스크린샷) */}
      <pre
        data-testid="debug-report"
        className="min-h-0 flex-1 select-text overflow-auto whitespace-pre-wrap break-all px-3 pb-4 text-[11px] leading-[15px]"
      >
        {report}
      </pre>
    </div>
  );
}

/**
 * 뷰포트 진단 — **웹 높이 vs 웹뷰 높이**를 갈라 보기 위한 계측.
 *
 * "WKScrollView가 화면보다 훨씬 큰데 내용은 위에 붙는다"는 증상은 원인이 두 갈래고,
 * 둘은 숫자로 구분된다:
 *   ① 웹 문서가 뷰포트보다 크다 → 웹(CSS) 책임
 *   ② 웹뷰 **프레임/인셋**이 화면보다 크다 → 네이티브 책임. 웹은 그 큰 높이를 그대로 믿고
 *      `100dvh`로 늘어나므로, 아래쪽(탭바 등)이 화면 밖으로 밀리고 내용만 위에 남는다.
 *
 * 그래서 문서 높이만이 아니라 **화면 높이·dvh 실측·safe-area 인셋**을 함께 남긴다.
 * 실기기 WebView에는 콘솔이 없어 이 패널이 유일한 창구다.
 */
function readViewportDiagnostics(): string[] {
  if (typeof window === 'undefined' || typeof document === 'undefined') return [];
  const de = document.documentElement;

  // env()와 dvh는 JS에서 직접 못 읽는다 — 화면 밖 프로브에 실제로 적용해 계산값을 회수한다
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:0',
    'visibility:hidden',
    'pointer-events:none',
    'height:100dvh',
    'padding-top:env(safe-area-inset-top)',
    'padding-right:env(safe-area-inset-right)',
    'padding-bottom:env(safe-area-inset-bottom)',
    'padding-left:env(safe-area-inset-left)',
  ].join(';');
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const dvh = Math.round(probe.getBoundingClientRect().height);
  const inset = {
    top: cs.paddingTop,
    right: cs.paddingRight,
    bottom: cs.paddingBottom,
    left: cs.paddingLeft,
  };
  probe.remove();

  const vv = window.visualViewport;
  const screenH = window.screen?.height ?? 0;
  // 문서가 뷰포트보다 크면 웹 책임 — global.css가 html/body/#root를 100dvh + overflow:hidden으로
  // 묶어두었으므로 정상이라면 **항상 같아야 한다**
  const overflowing = de.scrollHeight > de.clientHeight;
  // dvh가 화면보다 크면 웹뷰 프레임/인셋이 과대하다는 뜻 — 네이티브 책임
  const oversized = screenH > 0 && dvh > screenH + 1;
  /*
   * 반대로 dvh가 화면보다 **작으면** 스크롤뷰가 레이아웃 뷰포트보다 크다는 뜻이다.
   * WKWebView는 `contentInsetAdjustmentBehavior`가 `.never`가 아니면 safe-area/탭바를
   * `adjustedContentInset`에 더하고, `dvh`는 그만큼 **깎인** 높이로 계산된다.
   * → 문서(WKContentView)가 스크롤뷰보다 짧아져 위로 붙고 아래에 빈 칸이 남는다.
   * 홈 인디케이터가 있는 기기에서만 인셋이 생기므로 "일부 기기에서만" 재현된다.
   */
  const shortfall = screenH > 0 ? screenH - dvh : 0;
  const undersized = shortfall > 1;

  return [
    '',
    '## 뷰포트 (레이아웃 원인 판별)',
    `screen=${window.screen?.width ?? '?'}x${screenH} dpr=${window.devicePixelRatio}`,
    `innerHeight=${window.innerHeight} outerHeight=${window.outerHeight} 100dvh=${dvh}`,
    `document scrollHeight=${de.scrollHeight} clientHeight=${de.clientHeight}`,
    vv
      ? `visualViewport h=${Math.round(vv.height)} offsetTop=${Math.round(vv.offsetTop)} scale=${vv.scale}`
      : 'visualViewport=미지원',
    `safe-area top=${inset.top} bottom=${inset.bottom} left=${inset.left} right=${inset.right}`,
    `판정: ${
      overflowing
        ? '❌ 웹 문서가 뷰포트보다 크다 → CSS 책임'
        : oversized
          ? `❌ 웹뷰 뷰포트(${dvh})가 화면(${screenH})보다 크다 → 네이티브 프레임/인셋 책임`
          : undersized
            ? `❌ 웹뷰 뷰포트(${dvh})가 화면(${screenH})보다 ${shortfall} 작다 → 스크롤뷰 인셋이 먹고 있다. ` +
              'scrollView.contentInsetAdjustmentBehavior = .never (네이티브)'
            : inset.top === '0px' && screenH > 0
              ? '⚠️ safe-area top=0 — 웹뷰가 노치 아래로 확장되지 않았거나 컨테이너가 인셋을 먹었다(네이티브)'
              : '✅ 웹 레이아웃은 뷰포트와 일치'
    }`,
    '',
  ];
}

/**
 * 완주결과뷰(V10) 수동 트리거.
 *
 * V10은 **실제로 달려야만** 뜨는 화면이라 브라우저에서는 확인할 길이 없었다. 여기서
 * `runCompleted`를 직접 쏘면 네이티브가 보낸 것과 **완전히 같은 경로**를 탄다 —
 * 리스너의 페이로드 검증 → store → 라우팅 → `GET /runs/{recordId}` → 티켓 렌더.
 * (mock 브릿지일 때만 동작한다. 실기기에서는 버튼이 비활성으로 보인다.)
 *
 * 기록 id는 **실제로 존재하는 본인 기록**이어야 한다 — 없는 id면 404, 숫자가 아니면 400이다.
 * MSW를 켜면 목 기록이 응답하므로 아무 숫자나 써도 된다.
 */
function RunCompletedTrigger({
  recordId,
  onRecordIdChange,
  onFired,
}: {
  recordId: string;
  onRecordIdChange: (value: string) => void;
  onFired: () => void;
}) {
  const [result, setResult] = useState<string | null>(null);

  function fire(): void {
    // 좌표는 군산 은파호수 부근 — 「주변 둘러보기」가 실제로 뭔가를 찾는 자리여야 의미가 있다
    const ok = emitMockBridgeEvent('runCompleted', {
      recordId: recordId.trim(),
      end: { lat: 35.9701, lng: 126.7402 },
    });
    if (!ok) {
      setResult('네이티브 브릿지에서는 쓸 수 없어요 (브라우저 전용)');
      return;
    }
    onFired();
  }

  return (
    <div className="shrink-0 border-t border-white/10 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-caption text-white/70">V10 완주결과</span>
        <input
          value={recordId}
          onChange={(e) => onRecordIdChange(e.target.value)}
          inputMode="numeric"
          aria-label="기록 id"
          placeholder="기록 id"
          className="w-20 rounded bg-white/10 px-2 py-1 text-caption text-white"
        />
        <button
          type="button"
          data-testid="debug-fire-run-completed"
          onClick={fire}
          className="rounded bg-white/15 px-2 py-1 text-caption"
        >
          runCompleted 발행
        </button>
      </div>
      {result && <p className="pt-1 text-caption text-white/60">{result}</p>}
    </div>
  );
}

function formatEntry(entry: LogEntry): string {
  const time = entry.at.slice(11, 23);
  const mark = entry.level === 'error' ? '✖' : entry.level === 'warn' ? '!' : '·';
  const meta = entry.meta ? ` ${safeJson(entry.meta)}` : '';
  return `${time} ${mark} ${entry.event}${meta}`;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '[직렬화 불가]';
  }
}
