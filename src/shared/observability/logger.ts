/**
 * 얇은 로거 (U1-P8, NFR-U1-SEC-03).
 * 개발 콘솔 로깅만. 토큰·세션 식별자 등 민감정보는 절대 로깅하지 않는다.
 * 원격 sink 주입 자리만 마련(후속).
 */
type Sink = (level: 'info' | 'warn' | 'error', event: string, meta?: Record<string, unknown>) => void;

let remoteSink: Sink | null = null;

/** 원격 수집 sink 등록(후속 단계용 placeholder) */
export function setRemoteSink(sink: Sink | null): void {
  remoteSink = sink;
}

function emit(level: 'info' | 'warn' | 'error', event: string, meta?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console[level](`[dallyeo] ${event}`, meta ?? '');
  }
  remoteSink?.(level, event, meta);
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => emit('info', event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => emit('warn', event, meta),
  error: (event: string, meta?: Record<string, unknown>) => emit('error', event, meta),
};
