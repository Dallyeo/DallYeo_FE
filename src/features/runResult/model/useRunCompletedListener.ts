import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Achievement, GeoPoint, RunCompletedPayload } from '@/domain/types';
import { toAssetUrl } from '@/shared/api/assetUrl';
import { bridgeService } from '@/shared/services/BridgeService';
import { logger } from '@/shared/observability/logger';
import { runResultStore } from './runResultStore';

/**
 * 네이티브 'runCompleted' 이벤트 전역 리스너 (D1). RootLayout에서 1회 마운트.
 *
 * 페이로드는 **runId + 도착 좌표뿐**이다 — 네이티브가 `POST /runs`로 저장까지 마친 뒤
 * 그 기록 id를 넘겨준다. 웹은 id를 store에 담고 완주결과뷰로 이동하며, 화면에서
 * `GET /runs/{id}`로 내용을 받아 그린다. 잘못된 페이로드는 무시.
 */
export function useRunCompletedListener(): void {
  const navigate = useNavigate();

  useEffect(() => {
    const stop = bridgeService.on('runCompleted', (raw) => {
      // 원본을 먼저 남긴다 — 여기서 걸러지면 화면 자체가 안 뜨는데, 실기기엔 콘솔이 없어
      // "네이티브가 보냈는데 웹이 버린 것"인지 "애초에 안 온 것"인지 구분할 방법이 없다.
      logger.info('runCompleted_received', { payload: raw });
      const payload = parsePayload(raw);
      if (!payload) {
        logger.error('runCompleted_invalid_payload', {
          hint: '{ runId: string, end: { lat: number, lng: number } } 형태여야 한다 (BRIDGE.md §3)',
          payload: raw,
        });
        return;
      }
      runResultStore.getState().setPayload(payload);
      navigate('/run-result');
    });
    return stop;
  }, [navigate]);
}

function isGeoPoint(value: unknown): value is GeoPoint {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return typeof p['lat'] === 'number' && typeof p['lng'] === 'number';
}

/**
 * 계약에 맞는 페이로드만 통과시킨다.
 * runId는 네이티브가 숫자로 줄 수도 있어(백엔드 `id`가 number다) 문자열로 정규화한다.
 */
function parsePayload(raw: unknown): RunCompletedPayload | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const p = raw as Record<string, unknown>;
  const runId = p['runId'];
  if (typeof runId !== 'string' && typeof runId !== 'number') return null;
  if (String(runId).length === 0) return null;
  // 도착 좌표는 `end`가 계약이지만, 이전 계약의 `endLocation`으로 와도 받아준다
  const end = isGeoPoint(p['end']) ? p['end'] : isGeoPoint(p['endLocation']) ? p['endLocation'] : null;
  if (!end) return null;
  const newAchievements = parseAchievements(p['newAchievements']);
  return {
    runId: String(runId),
    end,
    ...(newAchievements.length > 0 ? { newAchievements } : {}),
  };
}

/**
 * 결과창 도장 — 네이티브가 `POST /runs` 응답에서 받은 배열을 그대로 실어 보낸다.
 * 도장 아이콘은 서버 절대경로(`/images/achievements/...`)라 base를 붙여야 뜬다.
 * 모양이 안 맞는 항목은 조용히 버린다 — 도장 하나 때문에 화면 전체를 못 뜨게 할 이유가 없다.
 */
function parseAchievements(value: unknown): Achievement[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (typeof raw !== 'object' || raw === null) return [];
    const a = raw as Record<string, unknown>;
    if (typeof a['code'] !== 'string' || typeof a['name'] !== 'string') return [];
    const on = toAssetUrl(typeof a['iconOnUrl'] === 'string' ? a['iconOnUrl'] : undefined);
    const off = toAssetUrl(typeof a['iconOffUrl'] === 'string' ? a['iconOffUrl'] : undefined);
    return [
      {
        ...(a as unknown as Achievement),
        ...(on ? { iconOnUrl: on } : {}),
        ...(off ? { iconOffUrl: off } : {}),
      },
    ];
  });
}
