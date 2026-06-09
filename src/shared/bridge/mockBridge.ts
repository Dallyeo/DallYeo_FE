import type { BridgeAdapter, BridgeEventName, BridgeLoginResult } from './types';
import { BridgeError } from './types';
import type { AppSession, Unsubscribe } from '@/domain/types';

/** mock 로그인 시나리오 토글 (FD Q4=A, BR-U1-6) */
export type MockLoginScenario = 'success' | 'cancel' | 'fail';

function readScenario(): MockLoginScenario {
  if (typeof window === 'undefined') return 'success';
  const param = new URLSearchParams(window.location.search).get('mockLogin');
  if (param === 'cancel' || param === 'fail') return param;
  return 'success';
}

const MOCK_SESSION: AppSession = { userId: 'mock-user', displayName: '테스트 사용자' };
const MOCK_TOKEN = 'mock-token';

/**
 * 브라우저 단독 개발용 mock 브릿지 (NFR-BRIDGE-03).
 * 실제처럼 비동기로 응답. 로그인 시나리오는 ?mockLogin=cancel|fail 로 토글.
 */
export function createMockBridgeAdapter(
  opts: { loginScenario?: MockLoginScenario; delayMs?: number } = {},
): BridgeAdapter {
  const delay = opts.delayMs ?? 50;
  const listeners = new Map<BridgeEventName, Set<(payload: unknown) => void>>();

  function wait<T>(value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), delay));
  }
  function fail(kind: 'cancelled' | 'failed'): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new BridgeError(kind)), delay),
    );
  }

  async function invoke<T>(method: string, _params?: unknown): Promise<T> {
    switch (method) {
      case 'login': {
        const scenario = opts.loginScenario ?? readScenario();
        if (scenario === 'cancel') return fail('cancelled') as Promise<T>;
        if (scenario === 'fail') return fail('failed') as Promise<T>;
        const result: BridgeLoginResult = { session: MOCK_SESSION, token: MOCK_TOKEN };
        return wait(result) as Promise<T>;
      }
      case 'logout':
        return wait(undefined) as Promise<T>;
      case 'getCurrentSession':
        return wait(null) as Promise<T>;
      case 'getPermissionStatus':
      case 'requestPermission':
        return wait('granted') as Promise<T>;
      default:
        return wait(null) as Promise<T>;
    }
  }

  function post(_method: string, _params?: unknown): void {
    // mock: 단방향 호출은 무시(콘솔 디버깅 가능)
  }

  function on(event: BridgeEventName, handler: (payload: unknown) => void): Unsubscribe {
    let set = listeners.get(event);
    if (!set) {
      set = new Set();
      listeners.set(event, set);
    }
    set.add(handler);
    return () => set?.delete(handler);
  }

  /** 테스트/개발용: 이벤트 수동 발행 */
  function emit(event: BridgeEventName, payload: unknown): void {
    listeners.get(event)?.forEach((h) => h(payload));
  }

  return Object.assign({ invoke, post, on }, { emit }) as BridgeAdapter & {
    emit: (event: BridgeEventName, payload: unknown) => void;
  };
}
