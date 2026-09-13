import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RunResult } from '@/domain/types';
import { bridgeService } from '@/shared/services/BridgeService';
import { logger } from '@/shared/observability/logger';
import { runResultStore } from './runResultStore';

/**
 * 네이티브 'runCompleted' 이벤트 전역 리스너 (D1). RootLayout에서 1회 마운트.
 * 페이로드를 store에 저장하고 완주결과뷰로 이동한다. 잘못된 페이로드는 무시.
 */
export function useRunCompletedListener(): void {
  const navigate = useNavigate();

  useEffect(() => {
    const stop = bridgeService.on('runCompleted', (payload) => {
      // 원본을 먼저 남긴다 — 여기서 걸러지면 화면 자체가 안 뜨는데, 실기기엔 콘솔이 없어
      // "네이티브가 보냈는데 웹이 버린 것"인지 "애초에 안 온 것"인지 구분할 방법이 없다.
      logger.info('runCompleted_received', { payload: summarize(payload) });
      const missing = missingFields(payload);
      if (missing.length > 0) {
        logger.error('runCompleted_invalid_payload', {
          missing,
          hint: '네이티브가 보낸 필드 타입이 계약과 다르다 (BRIDGE.md §3)',
          payload: summarize(payload),
        });
        return;
      }
      runResultStore.getState().setResult(payload as RunResult);
      navigate('/run-result');
    });
    return stop;
  }, [navigate]);
}

/**
 * 계약에 어긋난 **필드 이름과 실제 타입**을 돌려준다.
 * 단순 boolean이면 "뭐가 틀렸는지"를 못 알려줘 네이티브와 핑퐁이 길어진다.
 */
function missingFields(payload: unknown): string[] {
  if (typeof payload !== 'object' || payload === null) return [`payload=${typeof payload}`];
  const p = payload as Record<string, unknown>;
  const expected: [string, string][] = [
    ['runId', 'string'],
    ['distanceKm', 'number'],
    ['completionRate', 'number'],
  ];
  return expected
    .filter(([key, type]) => typeof p[key] !== type)
    .map(([key, type]) => `${key}: ${type} 필요, 받은 값 ${typeof p[key]}`);
}

/** 로그에 실을 요약 — 폴리라인 좌표열은 수백 개라 길이만 남긴다 */
function summarize(payload: unknown): Record<string, unknown> {
  if (typeof payload !== 'object' || payload === null) return { raw: String(payload) };
  const p = payload as Record<string, unknown>;
  const { routePolyline, ...rest } = p;
  return {
    ...rest,
    routePolylineCount: Array.isArray(routePolyline) ? routePolyline.length : 0,
  };
}
