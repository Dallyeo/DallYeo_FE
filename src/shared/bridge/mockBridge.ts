import type {
  BridgeAdapter,
  BridgeEventName,
  BridgeLoginResult,
  BridgeSessionResult,
} from './types';
import { BridgeError } from './types';
import type { AppSession, Unsubscribe } from '@/domain/types';
import { env } from '@/shared/config/env';

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

/** 브라우저에서 실 백엔드에 붙기 위한 개발용 토큰 자리 (README·.env.example 참조) */
export const DEV_TOKEN_KEY = 'dallyeo.dev.token';

/**
 * mock 브릿지가 돌려줄 토큰.
 *
 * OAuth 핸드셰이크는 네이티브만 할 수 있어(`POST /auth/login/{provider}`는 진짜 소셜 토큰을
 * 요구한다) 브라우저 단독으로는 실 세션을 만들 수 없다. 대신 **기기에서 발급된 토큰을 복사해**
 * 여기에 넣으면 브라우저에서 그대로 실 백엔드를 호출할 수 있다 — iOS 빌드를 반복해 올리지
 * 않고도 로그인이 필요한 화면(기록·업적·내정보)을 개발/검증할 수 있다.
 *
 * 우선순위: localStorage(리빌드 불필요) > `VITE_DEV_ACCESS_TOKEN` > 가짜 토큰.
 * 가짜 토큰이면 실 백엔드는 401을 준다 — 그 경우엔 MSW를 켜고 쓰라는 뜻이다.
 */
function resolveToken(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(DEV_TOKEN_KEY);
      if (stored) return stored;
    } catch {
      // 프라이빗 모드 등 — 아래로 폴백
    }
  }
  return env.devAccessToken ?? MOCK_TOKEN;
}

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
        const result: BridgeLoginResult = { session: MOCK_SESSION, token: resolveToken() };
        return wait(result) as Promise<T>;
      }
      case 'logout':
      case 'deleteAccount':
        return wait(undefined) as Promise<T>;
      case 'getCurrentSession': {
        // 개발용 토큰이 있으면 새로고침해도 로그인 상태를 유지한다(실 기기 동작과 동일).
        // 없으면 종전대로 미로그인 — 게스트 흐름을 그대로 볼 수 있어야 한다.
        const token = resolveToken();
        const restored: BridgeSessionResult =
          token === MOCK_TOKEN ? null : { session: MOCK_SESSION, token };
        return wait(restored) as Promise<T>;
      }
      case 'getPermissionStatus':
      case 'requestPermission':
        return wait('granted') as Promise<T>;
      case 'pickProfilePhoto':
        return wait('https://placehold.co/120x120?text=Photo') as Promise<T>;
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
