import type { RunRepository } from '@/domain/repositories';
import type { GeoPoint, NearbyPlace, PlaceSegment, RunResult } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/observability/logger';

/** 백엔드 장소 항목 (backend-api.md §4 PlaceSummary) */
interface PlaceDto {
  id: string;
  name: string;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  thumbnailUrl?: string | null;
  /** /places/nearby 에서만 값 */
  distanceMeters?: number | null;
}

/**
 * TourAPI 카테고리(10종) → 화면 세그먼트(2종) 매핑.
 * 시안이 음식점/편의시설 2탭이므로 **먹는 곳만 restaurant**, 나머지는 편의시설로 묶는다.
 * ⚠️ 관광지(TOUR)까지 "편의시설"에 들어가는 건 어색하다 — 세그먼트 확장은 기획 확정 후.
 */
const RESTAURANT_CATEGORIES = new Set(['RESTAURANT', 'CAFE']);
function toSegment(category: string): PlaceSegment {
  return RESTAURANT_CATEGORIES.has(category) ? 'restaurant' : 'amenity';
}

function toPlace(d: PlaceDto): NearbyPlace {
  return {
    id: d.id,
    segment: toSegment(d.category),
    name: d.name,
    address: d.address ?? '',
    ...(d.thumbnailUrl ? { photoUrl: d.thumbnailUrl } : {}),
    ...(d.category ? { category: d.category } : {}),
    distanceM: Math.round(d.distanceMeters ?? 0),
    // 외부 지도 연결 — 백엔드가 URL을 주지 않아 좌표/이름으로 카카오맵 검색 링크를 만든다
    externalMapUrl:
      d.latitude != null && d.longitude != null
        ? `https://map.kakao.com/link/map/${encodeURIComponent(d.name)},${d.latitude},${d.longitude}`
        : `https://map.kakao.com/?q=${encodeURIComponent(d.name)}`,
  };
}

/** 완주 결과 → `POST /runs` 바디 (backend-api.md §7.1) */
function toRunBody(result: RunResult) {
  return {
    courseId: result.courseId ?? null,
    polyline: result.routePolyline,
    distanceMeters: Math.round(result.distanceKm * 1000),
    durationSeconds: result.durationSec,
    averagePaceSeconds: result.avgPaceSecPerKm,
    startedAt: result.startedAt ?? result.completedAt,
    finishedAt: result.completedAt,
  };
}

export const runRepository: RunRepository = {
  /** 완주 지점 주변 장소 — `GET /places/nearby` (공개 API). 반경은 스펙상 500m. */
  async listNearbyPlaces(endLocation: GeoPoint, radiusM = 500): Promise<NearbyPlace[]> {
    const rows = await apiClient.get<PlaceDto[]>(
      `/places/nearby?lat=${endLocation.lat}&lng=${endLocation.lng}&radius=${radiusM}`,
      { baseUrl: env.publicApiBaseUrl },
    );
    return rows.map(toPlace);
  },
  async saveResult(result: RunResult): Promise<{ recordId: string }> {
    const body = toRunBody(result);
    // 무엇을 보냈는지 남긴다 — 거리 0 / 폴리라인 0개처럼 **보낸 값 자체가 문제**인 경우가 많다.
    // (폴리라인 좌표열은 통째로 남기면 로그가 터지므로 개수만)
    logger.info('run_save_request', {
      distanceMeters: body.distanceMeters,
      durationSeconds: body.durationSeconds,
      averagePaceSeconds: body.averagePaceSeconds,
      polylineCount: body.polyline.length,
      courseId: body.courseId,
      startedAt: body.startedAt,
      finishedAt: body.finishedAt,
      nativeRunId: result.runId,
      note: '네이티브 runId는 바디에 포함되지 않는다(백엔드가 새 id를 발급)',
    });
    const saved = await apiClient.post<{ id: number | string }>('/runs', body);
    return { recordId: String(saved.id) };
  },
};
