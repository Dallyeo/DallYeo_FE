/**
 * 얇은 로거 (U1-P8, NFR-U1-SEC-03).
 * 토큰·세션 식별자 등 민감정보는 절대 로깅하지 않는다.
 *
 * 콘솔 출력은 dev에서만. 대신 **프로덕션 번들에서도 메모리 링버퍼에 쌓는다** —
 * 실기기(WebView)에는 콘솔을 열 방법이 없어서(Mac 연결 없이는 웹 인스펙터 불가)
 * 화면 위 디버그 패널(`DebugPanel`)이 이 버퍼를 그대로 보여준다.
 */
type Level = 'info' | 'warn' | 'error';
type Sink = (level: Level, event: string, meta?: Record<string, unknown>) => void;

export interface LogEntry {
  /** 화면 표시용 단조 증가 id */
  id: number;
  /** ISO 8601 */
  at: string;
  level: Level;
  event: string;
  meta?: Record<string, unknown> | undefined;
}

/** 오래된 것부터 버린다 — 메모리를 무한정 먹지 않게 */
const BUFFER_LIMIT = 300;

let remoteSink: Sink | null = null;
let seq = 0;
const buffer: LogEntry[] = [];
const listeners = new Set<() => void>();
/**
 * 최신순 스냅샷. **버퍼가 바뀔 때만** 새로 만든다 —
 * `useSyncExternalStore`는 렌더마다 getSnapshot을 호출하고 `Object.is`로 비교하므로,
 * 매번 새 배열을 돌려주면 무한 렌더에 빠진다.
 */
let snapshot: LogEntry[] = [];

/** 원격 수집 sink 등록(후속 단계용 placeholder) */
export function setRemoteSink(sink: Sink | null): void {
  remoteSink = sink;
}

/** 최신순 로그 스냅샷 (변경 전까지 같은 참조) */
export function getLogs(): LogEntry[] {
  return snapshot;
}

export function clearLogs(): void {
  buffer.length = 0;
  publish();
}

function publish(): void {
  snapshot = [...buffer].reverse();
  listeners.forEach((l) => l());
}

/** 버퍼 변경 구독 (디버그 패널용) */
export function subscribeLogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(level: Level, event: string, meta?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console[level](`[dallyeo] ${event}`, meta ?? '');
  }
  buffer.push({ id: ++seq, at: new Date().toISOString(), level, event, meta });
  if (buffer.length > BUFFER_LIMIT) buffer.shift();
  publish();
  remoteSink?.(level, event, meta);
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => emit('info', event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => emit('warn', event, meta),
  error: (event: string, meta?: Record<string, unknown>) => emit('error', event, meta),
};
