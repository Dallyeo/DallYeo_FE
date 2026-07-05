import type { RunResult } from '@/domain/types';

/**
 * 개발 프리뷰용 완주 결과 (네이티브 'runCompleted' payload 흉내).
 * 브라우저에서 V10을 미리보기 위한 용도. completionRate로 메시지 티어를 바꿔 확인.
 */
export function buildDevRunResult(completionRate: number): RunResult {
  return {
    runId: `dev-run-${Date.now()}`,
    courseId: 'c1',
    distanceKm: 10.23,
    durationSec: 3661,
    avgPaceSecPerKm: 495,
    calories: 200,
    completionRate,
    routePolyline: [
      { lat: 35.9678, lng: 126.7369 },
      { lat: 35.9701, lng: 126.7402 },
    ],
    staticMapImageUrl: 'https://placehold.co/600x450?text=Course+Route',
    endLocation: { lat: 35.9701, lng: 126.7402 },
    completedAt: new Date().toISOString(),
  };
}
