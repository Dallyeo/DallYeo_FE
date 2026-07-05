import type { Achievement, RegionProgress } from '@/domain/types';

/**
 * 업적 Repository (계약, V14). 기획 보류 — 데이터 계약만 확정.
 * getRegionProgress는 SVG 지도용(예약, 현재 UI 미사용).
 */
export interface AchievementRepository {
  list(): Promise<Achievement[]>;
  getRegionProgress(): Promise<RegionProgress[]>;
}
