/**
 * 업적 도메인 타입 (V14). 기획 보류 → **데이터모델만** 정의(UI는 placeholder).
 * 전북 지역 게이미피케이션 지도는 스타일드 SVG 컴포넌트 예정(지도 SDK 아님).
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  /** 달성 일시 (ISO). 미달성이면 undefined */
  achievedAt?: string;
}

/** 전북 시군 진행도 (V14 SVG 지도용 — 데이터모델만) */
export interface RegionProgress {
  regionCode: string;
  regionName: string;
  visited: boolean;
  runCount: number;
}

/** 업적 화면 데이터 묶음 (예약) */
export interface AchievementSummary {
  achievements: Achievement[];
  regions: RegionProgress[];
}
