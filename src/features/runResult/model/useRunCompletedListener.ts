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
      if (!isRunResult(payload)) {
        logger.warn('runCompleted_invalid_payload', { payload });
        return;
      }
      runResultStore.getState().setResult(payload);
      navigate('/run-result');
    });
    return stop;
  }, [navigate]);
}

function isRunResult(payload: unknown): payload is RunResult {
  if (typeof payload !== 'object' || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p.runId === 'string' &&
    typeof p.distanceKm === 'number' &&
    typeof p.completionRate === 'number'
  );
}
