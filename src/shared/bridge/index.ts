import type { BridgeAdapter, BridgeEventName } from './types';
import { createNativeBridgeAdapter } from './bridgeAdapter';
import { createMockBridgeAdapter } from './mockBridge';
import { env } from '@/shared/config/env';

export * from './types';

let adapter: BridgeAdapter | null = null;

/**
 * 환경에 맞는 브릿지 어댑터 해석 (P-3, NFR-BRIDGE-03).
 * - window.DallYeoBridge 존재 & 강제 mock 아님 → 네이티브 어댑터
 * - 그 외(브라우저/강제) → mock 어댑터
 */
export function resolveBridgeAdapter(): BridgeAdapter {
  if (adapter) return adapter;
  const hasNative = typeof window !== 'undefined' && !!window.DallYeoBridge;
  if (hasNative && !env.forceMockBridge && window.DallYeoBridge) {
    adapter = createNativeBridgeAdapter(window.DallYeoBridge);
  } else {
    adapter = createMockBridgeAdapter();
  }
  return adapter;
}

/** 테스트용: 어댑터 주입/초기화 */
export function __setBridgeAdapterForTest(a: BridgeAdapter | null): void {
  adapter = a;
}

/**
 * 개발용: 네이티브 이벤트를 **손으로 발행**한다 (mock 어댑터일 때만).
 *
 * 완주결과뷰(V10)는 실제로 달려야만 뜨는 화면이라 브라우저에서 확인할 방법이 없었다.
 * mock 어댑터에는 `emit`이 있으므로 디버그 패널이 이걸 통해 `runCompleted`를 쏴서
 * **실제와 같은 경로**(리스너 → 페이로드 검증 → store → 라우팅 → `GET /runs/{id}`)를 태운다.
 * 네이티브 어댑터에서는 아무것도 하지 않고 `false`를 돌려준다.
 */
export function emitMockBridgeEvent(event: BridgeEventName, payload: unknown): boolean {
  const current = resolveBridgeAdapter() as Partial<{
    emit: (e: BridgeEventName, p: unknown) => void;
  }>;
  if (typeof current.emit !== 'function') return false;
  current.emit(event, payload);
  return true;
}
