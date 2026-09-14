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
 *
 * **통과 기준은 도착 좌표 하나다.** 기록 id는 없어도 화면을 띄운다 — 저장이 실패했거나
 * 비로그인이면 id가 없는 게 정상이고, 그때도 좌표만으로 「주변 둘러보기」는 동작한다.
 */
function parsePayload(raw: unknown): RunCompletedPayload | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const p = raw as Record<string, unknown>;
  // 도착 좌표는 `end`가 계약이지만, 이전 계약의 `endLocation`으로 와도 받아준다
  const end = isGeoPoint(p['end']) ? p['end'] : isGeoPoint(p['endLocation']) ? p['endLocation'] : null;
  if (!end) return null;
  const recordId = pickRecordId(p);
  const newAchievements = parseAchievements(p['newAchievements']);
  return {
    ...(recordId ? { recordId } : {}),
    end,
    ...(newAchievements.length > 0 ? { newAchievements } : {}),
  };
}

/**
 * 조회에 쓸 **백엔드 기록 id** 고르기.
 *
 * 계약상 이름은 `runId`지만, iOS는 현재 `runId`에 **`clientRunId`(UUID 멱등키)** 를 싣고
 * 진짜 기록 id를 `recordId`로 따로 보낸다(2026-09-14 확인). 백엔드 `GET /runs/{id}`는
 * `@PathVariable Long`이라 UUID를 보내면 **무조건 400**이다.
 *
 * 그래서 이름을 믿지 않고 **값의 모양**으로 고른다 — 후보 중 숫자로만 이루어진 첫 값.
 * 어느 쪽이 먼저 배포되든 동작하고, 양쪽이 `runId`로 정리되면 이 함수는 그대로 통과한다.
 */
function pickRecordId(p: Record<string, unknown>): string | undefined {
  for (const key of ['recordId', 'runId'] as const) {
    const value = p[key];
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    const text = String(value).trim();
    // 백엔드 id는 Long — 숫자가 아니면 조회에 쓸 수 없다(400)
    if (/^\d+$/.test(text)) return text;
  }
  // 값은 왔는데 전부 숫자가 아니면 **계약 불일치**다. 화면은 띄우되 원인을 남긴다.
  const seen = ['recordId', 'runId'].filter((k) => p[k] !== undefined);
  if (seen.length > 0) {
    logger.error('runCompleted_unusable_record_id', {
      seen: Object.fromEntries(seen.map((k) => [k, String(p[k])])),
      hint: 'GET /runs/{id}는 Long만 받는다 — clientRunId(UUID)가 아니라 POST /runs 응답의 data.id를 보내야 한다',
    });
  }
  return undefined;
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
