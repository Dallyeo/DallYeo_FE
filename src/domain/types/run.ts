/**
 * 완주 결과 도메인 타입 (V10). 네이티브 'runCompleted' 이벤트 페이로드가 계약.
 * 지도는 정적 이미지 URL(지도 SDK 아님, FR-V10). 폴리라인은 백업/표시 좌표열.
 */

/** 위경도 좌표 */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * 완주 결과 (FR-V10). 거리/시간/페이스/칼로리/완주율 + 정적 지도 + 종료 위치.
 * 'runCompleted' 이벤트로 수신하며, 로그인 시에만 백엔드에 저장된다(비로그인 저장 X).
 */
export interface RunResult {
  runId: string;
  courseId?: string;
  /** 뛴 거리(km) */
  distanceKm: number;
  /** 소요 시간(초) */
  durationSec: number;
  /** 평균 페이스(초/km) */
  avgPaceSecPerKm: number;
  /** 소모 칼로리(kcal) */
  calories: number;
  /** 완주율 (0~100, %) */
  completionRate: number;
  /** 경로 폴리라인 좌표열(출발/경유/도착 포함) */
  routePolyline: GeoPoint[];
  /** 정적 지도 이미지 URL (줌 없음, 지도 SDK 아님) */
  staticMapImageUrl: string;
  /** 완주 종료 위치 — 주변 장소(500m) 조회 기준 */
  endLocation: GeoPoint;
  /** 완주 시각 (ISO 8601) */
  completedAt: string;
}

/** 완주율 메시지 티어 (BR: 100% / 50%↑ / 50%↓) */
export type CompletionTier = 'complete' | 'half' | 'low';

/** 주변 장소 세그먼트 — 편의시설 / 음식점 (FR-V10 하단 패널) */
export type PlaceSegment = 'amenity' | 'restaurant';

/**
 * 완주 위치 근방 주변 장소 (FR-V10, 반경 500m).
 * 선택 시 외부 지도(카카오/네이버)로 연결 → externalMapUrl.
 */
export interface NearbyPlace {
  id: string;
  segment: PlaceSegment;
  name: string;
  address: string;
  photoUrl?: string;
  /** 완주 위치와의 거리(m) */
  distanceM: number;
  /** 외부 지도 연결 URL (카카오/네이버) */
  externalMapUrl: string;
}
