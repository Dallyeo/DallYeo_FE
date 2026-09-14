/**
 * 완주 결과 도메인 타입 (V10).
 *
 * ⚠️ 2026-09-14 계약 변경 — **저장 주체가 네이티브로 넘어갔다.**
 * 웹은 `POST /runs`를 더 이상 호출하지 않는다(multipart + 경로 이미지 업로드는 iOS가 한다).
 * 네이티브는 저장을 끝낸 뒤 'runCompleted'로 **runId와 도착 좌표만** 넘기고, 웹은
 *   - `GET /runs/{runId}` 로 결과를 받아 화면을 그리고(be-spec-new-260913 §7.4),
 *   - 도착 좌표로 `GET /places/nearby` 를 불러 「주변 둘러보기」를 채운다(§4.3).
 * 비로그인이라 저장이 실패한 경우의 보관·재시도도 네이티브가 담당한다(웹은 안내 팝업만).
 */
import type { Achievement } from './achievement';

/** 위경도 좌표 */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * 네이티브 'runCompleted' 이벤트 페이로드 (BRIDGE 계약).
 * 통계·경로는 들어 있지 않다 — 전부 `GET /runs/{runId}`로 받아온다.
 */
export interface RunCompletedPayload {
  /**
   * `GET /runs/{id}` 조회에 쓸 **백엔드 기록 id**(`POST /runs` 응답의 `data.id`).
   *
   * ⚠️ 백엔드는 `@PathVariable Long`이라 **숫자가 아니면 400**이다. 그래서 리스너가
   * 숫자로 보이는 값만 여기에 넣는다 — `clientRunId`(UUID 멱등키)가 섞여 들어오면 버린다.
   * 저장 실패·비로그인이면 없을 수 있고, 그때도 좌표만으로 「주변 둘러보기」는 동작한다.
   */
  recordId?: string;
  /** 완주 종료 좌표 — 주변 장소(500m) 조회 기준 */
  end: GeoPoint;
  /**
   * 결과창 도장 (§7.1 `newAchievements`).
   *
   * ⚠️ 이 값은 **`POST /runs` 응답에만** 있다 — §7.4가 "`GET /runs/{id}`에는 이 필드 자체가 없어,
   * 지난 기록을 다시 열어도 도장이 재생되지 않습니다"라고 못박았다. 저장하는 주체가 네이티브이므로
   * **네이티브만 이 배열을 볼 수 있고**, 여기에 실어 넘겨야 웹이 도장을 띄울 수 있다.
   * 여러 건을 몰아 올린 경우 합치는 것도 네이티브 몫(client-run-sync-guide §6-③).
   * 아직 안 와도 화면은 정상 동작한다 — 도장 줄만 안 그려진다.
   */
  newAchievements?: Achievement[];
}

/**
 * 완주 결과 (`GET /runs/{id}` 응답을 도메인 단위로 옮긴 값).
 *
 * ⚠️ 백엔드는 **값이 없는 필드의 키를 통째로 뺀다**(`null`이 아니다, §1) → 전부 옵셔널.
 * 완주율은 아직 계산하지 않는다(§7.1) — 응답에 없다.
 */
export interface RunResult {
  runId: string;
  /** 공식 코스면 코스 id. 자유 러닝이면 없음 */
  courseId?: string;
  /** 코스명 — 코스를 못 찾으면 키 자체가 없다 */
  courseName?: string;
  /** 출발 좌표 */
  start?: GeoPoint;
  /** 도착 좌표 */
  end?: GeoPoint;
  /** 뛴 거리(km) */
  distanceKm: number;
  /** 소요 시간(초) */
  durationSec: number;
  /** 평균 페이스(초/km) — 서버가 거리·시간으로 계산해 준다 */
  avgPaceSecPerKm: number;
  /**
   * 소모 칼로리(kcal). **서버가 계산하지 않는다** — 네이티브가 보낸 값(HealthKit)을 그대로 돌려준다
   * (be-api-guide-0914 §7.1). 안 보냈으면 키 자체가 없다.
   */
  calories?: number;
  /** 네이티브가 올린 경로 이미지 (API base가 붙은 절대 URL). 없으면 회색 자리 */
  routeImageUrl?: string;
  /** 시작 시각 (ISO 8601). 시안의 "12:00 - 12:30" 구간 표시에 사용 */
  startedAt?: string;
  /** 완주 시각 (ISO 8601) = 백엔드 `finishedAt` */
  completedAt: string;
  /**
   * 이번 러닝으로 **처음 달성한** 업적 — 결과창 도장 (§7.1 `newAchievements`).
   * 명세상 `GET /runs/{id}`에는 없다고 적혀 있으나 오면 그대로 띄운다(없으면 도장 없음).
   */
  newAchievements?: Achievement[];
}

/** 완주율 메시지 티어 (BR: 100% / 50%↑ / 50%↓) — 백엔드 완주율 제공 시 재사용 */
export type CompletionTier = 'complete' | 'half' | 'low';

/**
 * 완주 위치 근방 **음식점** (FR-V10, 반경 500m).
 * 선택 시 외부 지도(카카오/네이버)로 연결 → externalMapUrl.
 *
 * ⚠️ 시안에는 「음식점 / 편의시설」 2탭이 있었으나 **편의시설은 제거**됐다
 * (2026-09-15 사용자 결정). TourAPI 카테고리 10종 중 먹는 곳(RESTAURANT·CAFE)만 남기고,
 * 관광지·숙박 같은 나머지는 애초에 목록에 넣지 않는다 — "편의시설"로 묶기에 어색했다.
 */
export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  photoUrl?: string;
  /** 업종 (시안: 이름 옆 "디저트") */
  category?: string;
  /** 대표 영업시간 (§4 `openHours` — `businessHours`의 첫 항목) */
  businessHours?: string;
  /** 현재 영업중 여부 (시안: 초록 "영업중" 배지). 백엔드 미제공 — 표시 안 함 */
  isOpenNow?: boolean;
  /** 전화번호 — 있으면 「전화하기」 노출. 백엔드 미제공 */
  phoneNumber?: string;
  /** 완주 위치와의 거리(m) */
  distanceM: number;
  /** 외부 지도 연결 URL (카카오/네이버) */
  externalMapUrl: string;
}
