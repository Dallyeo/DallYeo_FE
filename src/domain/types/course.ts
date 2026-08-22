/**
 * 지역/코스 도메인 타입 (FR-V02)
 */

/** 지원 지역 코드 (백엔드 enum). be-api-spec-recieved-sprint4.md §1 */
export type RegionCode = 'GUNSAN' | 'JEONJU';

/** 코스 거리 분류 (백엔드 enum). */
export type DistanceCategory = 'SHORT' | 'MEDIUM' | 'LONG';

/** 지역. code는 RegionCode(대문자 enum), 다중 지역 확장 가능 (NFR-DATA-02). */
export interface Region {
  code: string;
  name: string;
}

/** 추천 코스. previewImageUrl은 정적 이미지(지도 SDK 아님, FR-V02-07). */
export interface Course {
  id: string;
  title: string;
  description: string;
  distanceKm: number;
  /** 예상 소요 시간(표시용 문자열) */
  estimatedTime: string;
  previewImageUrl: string;
  regionCode: string;
  /**
   * 난이도(거리 분류). 코스정보 팝업의 "난이도" 행에 표시.
   * 백엔드 마이그레이션(U10-B) 전까지 목에만 존재 → optional.
   */
  distanceCategory?: DistanceCategory;
  /**
   * 경유지 이름 목록. 코스정보 팝업 하단 목록에 표시.
   * U10-B의 `waypointAnchors`로 대체 예정 → optional.
   */
  waypoints?: string[];
}

/** 난이도 표시 문구 (코스정보 팝업). */
export const DISTANCE_CATEGORY_LABEL: Record<DistanceCategory, string> = {
  SHORT: 'Easy',
  MEDIUM: 'Medium',
  LONG: 'Hard',
};
