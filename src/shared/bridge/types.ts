import type { AppSession, AuthProvider, PermissionType, PermissionStatus, Unsubscribe } from '@/domain/types';

/** bridge.login 결과: 토큰은 apiClient(메모리)로, 세션은 store로 분리 (FD Q1=A) */
export interface BridgeLoginResult {
  session: AppSession;
  token: string;
}

export type BridgeEventName =
  | 'runCompleted'
  | 'runCancelled'
  | 'permissionChanged'
  | 'sessionChanged';

export interface SessionChangedPayload {
  status: 'authenticated' | 'unauthenticated';
  session?: AppSession;
  token?: string;
}

export type BridgeErrorKind = 'cancelled' | 'failed' | 'timeout';

export class BridgeError extends Error {
  readonly kind: BridgeErrorKind;
  constructor(kind: BridgeErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'BridgeError';
    this.kind = kind;
  }
}

/**
 * 저수준 브릿지 어댑터. request-id + promise registry 패턴.
 * BridgeService가 이 위에서 동작. 플랫폼 구현(iOS/Android) 또는 mock이 구현.
 */
export interface BridgeAdapter {
  /** 비동기 요청(응답 대기). 타임아웃 시 BridgeError('timeout') */
  invoke<T>(method: string, params?: unknown): Promise<T>;
  /** 단방향 호출(응답 없음) */
  post(method: string, params?: unknown): void;
  /** 네이티브→웹 이벤트 구독 */
  on(event: BridgeEventName, handler: (payload: unknown) => void): Unsubscribe;
}

export type { AuthProvider, PermissionType, PermissionStatus };
