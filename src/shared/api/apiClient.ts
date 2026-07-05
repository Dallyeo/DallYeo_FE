import type { Unsubscribe } from '@/domain/types';
import { env } from '@/shared/config/env';

/** HTTP 에러 */
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
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
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = path.startsWith('http') ? path : `${env.apiBaseUrl}${path}`;
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
    throw new ApiError(401);
  }
  if (!res.ok) {
    throw new ApiError(res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
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
