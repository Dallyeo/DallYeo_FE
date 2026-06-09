/**
 * 지역/코스 도메인 타입 (FR-V02)
 */

/** 지역. code는 string(하드코딩 금지), 다중 지역 확장 가능 (NFR-DATA-02). */
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
}
