import type { Unsubscribe } from '@/domain/types';
import { env } from '@/shared/config/env';

/** 백엔드 에러 코드(고정 문자열, 프론트 분기용). be-api-spec-recieved-sprint4.md §1 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'EXTERNAL_API_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT';

export interface ApiErrorDetail {
  field: string;
  message: string;
}

/** HTTP/도메인 에러. code는 백엔드 error.code(있을 때만), details는 VALIDATION_ERROR에서만. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: ApiErrorDetail[] | undefined;
  constructor(
    status: number,
    opts?: {
      code?: string | undefined;
      message?: string | undefined;
      details?: ApiErrorDetail[] | undefined;
    },
  ) {
    super(opts?.message ?? opts?.code ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = opts?.code;
    this.details = opts?.details;
  }
}

/** 백엔드 공통 응답 래퍼. be-api-spec-recieved-sprint4.md §1 */
interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: ApiErrorDetail[] };
}

/** 값이 {success, data|error} 래퍼인지 판별 (하위호환: 래퍼 아니면 원본 그대로 반환) */
function isEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return typeof body === 'object' && body !== null && 'success' in body;
}

/**
 * 토큰은 모듈 스코프 클로저에만 보관 (NFR-U1-SEC-12a, U1-P1).
 * 외부엔 setToken/clearToken만 노출 — 토큰 값 getter 없음.
 */
let token: string | null = null;

let onUnauthorizedHandler: (() => void) | null = null;

export function setToken(next: string | null): void {
  token = next;
}
export function clearToken(): void {
  token = null;
}

/** 401 감지 시 호출될 콜백 등록 (U1-P2). SessionService가 등록. */
export function onUnauthorized(handler: () => void): Unsubscribe {
  onUnauthorizedHandler = handler;
  return () => {
    if (onUnauthorizedHandler === handler) onUnauthorizedHandler = null;
  };
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** 요청 base URL 재정의. 공개 API(regions/courses/places)는 env.publicApiBaseUrl 사용. */
  baseUrl?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const base = options.baseUrl ?? env.apiBaseUrl;
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  };

  const res = await fetch(url, init);

  if (res.status === 401) {
    // 세션 무효화는 콜백 경로로 분리 (U1-P2, BR-U1-4)
    onUnauthorizedHandler?.();
    throw new ApiError(401, { code: 'UNAUTHORIZED' });
  }
  if (res.status === 204) return undefined as T;

  // 본문 파싱(에러 응답도 래퍼일 수 있으므로 상태와 무관하게 시도)
  const body: unknown = await res.json().catch(() => undefined);

  if (!res.ok) {
    const err = isEnvelope(body) ? body.error : undefined;
    throw new ApiError(res.status, {
      code: err?.code,
      message: err?.message,
      details: err?.details,
    });
  }

  if (isEnvelope(body)) {
    if (body.success === false) {
      throw new ApiError(res.status, {
        code: body.error?.code,
        message: body.error?.message,
        details: body.error?.details,
      });
    }
    return body.data as T;
  }
  // 하위호환: 래퍼가 아니면(구 MSW mock 등) 원본을 그대로 반환
  return body as T;
}

/**
 * 재시도 래퍼. 기본은 502/EXTERNAL_API_ERROR(외부 관광 API 지연)만 재시도.
 * be-api-spec-recieved-sprint4.md §5-3: /places/* 는 간헐 502 → 1~2회 재시도 권장.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; shouldRetry?: (e: unknown) => boolean } = {},
): Promise<T> {
  const retries = opts.retries ?? 2;
  const shouldRetry =
    opts.shouldRetry ??
    ((e: unknown) => e instanceof ApiError && (e.status === 502 || e.code === 'EXTERNAL_API_ERROR'));
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === retries || !shouldRetry(e)) throw e;
    }
  }
  throw lastError;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  setToken,
  clearToken,
  onUnauthorized,
};
