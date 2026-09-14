import type { RunCompletedPayload } from '@/domain/types';

/**
 * 개발 프리뷰용 'runCompleted' 페이로드 (네이티브 이벤트 흉내).
 * 브라우저에서 V10을 미리보기 위한 용도 — 실제 내용은 `GET /runs/{recordId}`가 채운다
 * (MSW를 켜면 목 기록이, 끄고 dev 토큰을 넣으면 실 백엔드 기록이 뜬다).
 */
export function buildDevRunPayload(recordId = '1'): RunCompletedPayload {
  return {
    recordId,
    end: { lat: 35.9701, lng: 126.7402 },
  };
}
