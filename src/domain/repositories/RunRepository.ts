import type { GeoPoint, NearbyPlace, RunResult } from '@/domain/types';

/**
 * 완주 결과 Repository (V10).
 *
 * ⚠️ **저장(`POST /runs`)은 여기 없다** — 2026-09-14부터 네이티브가 담당한다.
 * 웹은 네이티브가 준 runId로 결과를 **읽기만** 한다.
 * - 결과: `GET /runs/{id}` (인증 필요, §7.4)
 * - 주변 장소: `GET /places/nearby?lat&lng&radius` (공개 API, §4.3 — 완주 지점 기준)
 */
export interface RunRepository {
  getResult(runId: string): Promise<RunResult>;
  listNearbyPlaces(end: GeoPoint, radiusM?: number): Promise<NearbyPlace[]>;
}
