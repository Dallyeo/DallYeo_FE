import type { RunRepository } from '@/domain/repositories';
import type { Achievement, GeoPoint, NearbyPlace, RunResult } from '@/domain/types';
import { apiClient, withRetry } from '@/shared/api/apiClient';
import { toAssetUrl } from '@/shared/api/assetUrl';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/observability/logger';

/** 백엔드 장소 항목 (be-spec-new-260913 §4 PlaceSummary) */
interface PlaceDto {
  id: string;
  name: string;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  /** TourAPI 원문을 정리한 전체 영업시간(개행 구분). 카드에는 openHours를 쓴다 */
  businessHours?: string | null;
  /** businessHours의 첫 항목(대표값) — 카드 한 줄용 */
  openHours?: string | null;
  thumbnailUrl?: string | null;
  /** /places/nearby 에서만 값 */
  distanceMeters?: number | null;
  /** 모범음식점/착한가격업소. 없으면 [] */
  badges?: string[];
}

/** 백엔드 러닝 기록 (§7.4 `GET /runs/{id}`) — 값이 없으면 **키 자체가 없다** */
interface RunDto {
  id: number | string;
  courseId?: string;
  courseName?: string;
  start?: { lat: number; lng: number };
  end?: { lat: number; lng: number };
  distanceMeters: number;
  durationSeconds: number;
  averagePaceSeconds?: number;
  /** 네이티브(HealthKit)가 보낸 값을 서버가 그대로 보관해 돌려준다 */
  calories?: number;
  imageUrl?: string;
  startedAt?: string;
  finishedAt: string;
  /** §7.1 저장 응답 전용이라고 적혀 있으나, 오면 결과창 도장으로 쓴다 */
  newAchievements?: Achievement[];
}

/**
 * 「주변 둘러보기」에 넣을 카테고리 — **먹는 곳만**.
 *
 * 시안에는 「음식점 / 편의시설」 2탭이 있었지만 편의시설 탭은 제거됐다(2026-09-15 사용자 결정).
 * TourAPI 카테고리 10종 중 나머지(TOUR·STAY·SHOPPING…)를 "편의시설"로 묶는 게 어색했고,
 * 실제로 반경 500m 안에서 거의 비어 있었다.
 *
 * ⚠️ 서버 `category` 파라미터로 거르지 않고 **받아서 거른다** — 파라미터는 한 종류만 받는데
 * 우리는 RESTAURANT과 CAFE 둘 다 필요해서 두 번 호출해야 하기 때문이다.
 */
const FOOD_CATEGORIES = new Set(['RESTAURANT', 'CAFE']);

/**
 * TourAPI 이미지가 **`http://`로 온다** — 그대로 쓰면 사진이 안 뜬다.
 *  - 웹: `index.html`의 CSP가 `img-src 'self' https: data:` 라 평문 http를 막는다
 *  - iOS: ATS(App Transport Security)가 기본적으로 http를 막는다
 * `tong.visitkorea.or.kr`은 https로도 같은 파일을 주므로(실측 200) 스킴만 올린다.
 * 백엔드가 https로 정규화해 주면 이 함수는 그대로 통과한다.
 */
function toHttps(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith('http://') ? `https://${url.slice('http://'.length)}` : url;
}

function toPlace(d: PlaceDto): NearbyPlace {
  // 카드 한 줄에는 대표 영업시간(openHours)을 쓴다. 없으면 전체(businessHours)의 첫 줄로 대신한다
  // — 첫 호출에서 드물게 openHours만 비는 경우가 있다(§4 주의).
  const hours = d.openHours ?? d.businessHours?.split('\n')[0];
  const photo = toHttps(d.thumbnailUrl);
  return {
    id: d.id,
    name: d.name,
    address: d.address ?? '',
    ...(photo ? { photoUrl: photo } : {}),
    ...(d.category ? { category: d.category } : {}),
    ...(hours ? { businessHours: hours } : {}),
    distanceM: Math.round(d.distanceMeters ?? 0),
    // 외부 지도 연결 — 백엔드가 URL을 주지 않아 좌표/이름으로 카카오맵 검색 링크를 만든다
    externalMapUrl:
      d.latitude != null && d.longitude != null
        ? `https://map.kakao.com/link/map/${encodeURIComponent(d.name)},${d.latitude},${d.longitude}`
        : `https://map.kakao.com/?q=${encodeURIComponent(d.name)}`,
  };
}

/** 업적 도장 — 아이콘 경로는 서버 절대경로라 base를 붙여야 뜬다 (§8 도장 이미지) */
function toAchievement(a: Achievement): Achievement {
  const on = toAssetUrl(a.iconOnUrl);
  const off = toAssetUrl(a.iconOffUrl);
  return { ...a, ...(on ? { iconOnUrl: on } : {}), ...(off ? { iconOffUrl: off } : {}) };
}

/** `GET /runs/{id}` 응답 → 도메인 완주 결과 */
export function toRunResult(d: RunDto): RunResult {
  const distanceKm = d.distanceMeters / 1000;
  const image = toAssetUrl(d.imageUrl);
  return {
    runId: String(d.id),
    ...(d.courseId ? { courseId: d.courseId } : {}),
    ...(d.courseName ? { courseName: d.courseName } : {}),
    ...(d.start ? { start: d.start } : {}),
    ...(d.end ? { end: d.end } : {}),
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationSec: d.durationSeconds,
    // 서버가 계산해 주지만, 혹시 빠져도 거리·시간으로 채운다
    avgPaceSecPerKm:
      d.averagePaceSeconds ?? (distanceKm > 0 ? Math.round(d.durationSeconds / distanceKm) : 0),
    ...(d.calories !== undefined ? { calories: d.calories } : {}),
    ...(image ? { routeImageUrl: image } : {}),
    ...(d.startedAt ? { startedAt: d.startedAt } : {}),
    completedAt: d.finishedAt,
    ...(d.newAchievements?.length
      ? { newAchievements: d.newAchievements.map(toAchievement) }
      : {}),
  };
}

export const runRepository: RunRepository = {
  /**
   * 완주 결과 — `GET /runs/{id}` (§7.4).
   * 저장은 네이티브가 이미 끝냈고, 웹은 그 id로 읽기만 한다.
   */
  async getResult(runId: string): Promise<RunResult> {
    const dto = await apiClient.get<RunDto>(`/runs/${encodeURIComponent(runId)}`);
    // 무엇을 받았는지 남긴다 — 실기기엔 Network 탭이 없어 "코스명이 왜 안 뜨지"를 여기서 본다
    logger.info('run_result_loaded', {
      runId,
      distanceMeters: dto.distanceMeters,
      durationSeconds: dto.durationSeconds,
      hasCourseName: dto.courseName !== undefined,
      hasImage: dto.imageUrl !== undefined,
      hasCalories: dto.calories !== undefined,
      newAchievements: dto.newAchievements?.length ?? 0,
    });
    return toRunResult(dto);
  },

  /** 완주 지점 주변 장소 — `GET /places/nearby` (공개 API). 반경은 스펙상 500m. */
  async listNearbyPlaces(end: GeoPoint, radiusM = 500): Promise<NearbyPlace[]> {
    // 외부 관광 API라 간헐 502가 난다 — 명세가 재시도를 권장한다 (§4, §9-3)
    const rows = await withRetry(() =>
      apiClient.get<PlaceDto[]>(
        `/places/nearby?lat=${end.lat}&lng=${end.lng}&radius=${radiusM}`,
        { baseUrl: env.publicApiBaseUrl },
      ),
    );
    return rows.filter((row) => FOOD_CATEGORIES.has(row.category)).map(toPlace);
  },
};
