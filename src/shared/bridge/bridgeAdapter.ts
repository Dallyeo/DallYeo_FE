import type { BridgeAdapter, BridgeEventName } from './types';
import { BridgeError } from './types';
import type { Unsubscribe } from '@/domain/types';

/** 브릿지 호출 타임아웃 (U1-P6, NFR-U1-REL-01) */
export const BRIDGE_TIMEOUT_MS = 10_000;

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * window.DallYeoBridge 위의 저수준 어댑터.
 * postMessage는 단방향이므로 request-id + promise registry로 응답을 매칭한다.
 *
 * 네이티브 측 계약(가정):
 *  - 웹→네이티브: window.DallYeoBridge.postMessage(JSON.stringify({ id, method, params }))
 *  - 네이티브→웹: window.__dallyeoBridgeResolve({ id, ok, data?, error? })
 *  - 이벤트: window.__dallyeoBridgeEmit({ event, payload })
 */
interface NativeBridge {
  postMessage(message: string): void;
}

declare global {
  interface Window {
    DallYeoBridge?: NativeBridge;
    __dallyeoBridgeResolve?: (msg: {
      id: string;
      ok: boolean;
      data?: unknown;
      error?: { kind?: string; message?: string };
    }) => void;
    __dallyeoBridgeEmit?: (msg: { event: BridgeEventName; payload: unknown }) => void;
  }
}

export function createNativeBridgeAdapter(native: NativeBridge): BridgeAdapter {
  const pending = new Map<string, PendingRequest>();
  const listeners = new Map<BridgeEventName, Set<(payload: unknown) => void>>();
  let counter = 0;

  window.__dallyeoBridgeResolve = (msg) => {
    const req = pending.get(msg.id);
    if (!req) return;
    pending.delete(msg.id);
    clearTimeout(req.timer);
    if (msg.ok) {
      req.resolve(msg.data);
    } else {
      const kind = msg.error?.kind === 'cancelled' ? 'cancelled' : 'failed';
      req.reject(new BridgeError(kind, msg.error?.message));
    }
  };

  window.__dallyeoBridgeEmit = (msg) => {
    listeners.get(msg.event)?.forEach((h) => h(msg.payload));
  };

  function invoke<T>(method: string, params?: unknown): Promise<T> {
    const id = `req_${++counter}`;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new BridgeError('timeout', `브릿지 응답 시간 초과: ${method}`));
      }, BRIDGE_TIMEOUT_MS);
      pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
      native.postMessage(JSON.stringify({ id, method, params }));
    });
  }

  function post(method: string, params?: unknown): void {
    native.postMessage(JSON.stringify({ method, params }));
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

  return { invoke, post, on };
}
