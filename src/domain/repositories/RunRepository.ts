import type { GeoPoint, NearbyPlace, RunResult } from '@/domain/types';

/**
 * 완주 결과 Repository (V10).
 * - 주변 장소: 공개 API `GET /places/nearby?lat&lng&radius` (완주 지점 기준)
 * - 저장: `POST /runs` (인증 필요)
 */
export interface RunRepository {
  listNearbyPlaces(endLocation: GeoPoint, radiusM?: number): Promise<NearbyPlace[]>;
  saveResult(result: RunResult): Promise<{ recordId: string }>;
}
