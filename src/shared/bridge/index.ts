import type { BridgeAdapter } from './types';
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
