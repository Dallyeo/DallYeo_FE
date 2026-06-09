/**
 * 지역 로직 (BR-4, FR-V02-08). 기본 지역 해석: 군산 우선 → 첫 항목 → placeholder (FD Q5).
 * 항상 유효한 Region 반환(non-null).
 */
import type { Region } from '@/domain/types';
import { DEFAULT_REGION_CODE, DEFAULT_REGION_NAME } from '@/domain/constants';

const FALLBACK_REGION: Region = { code: DEFAULT_REGION_CODE, name: DEFAULT_REGION_NAME };

export function resolveDefaultRegion(regions: readonly Region[]): Region {
  const gunsan = regions.find((r) => r.code === DEFAULT_REGION_CODE);
  if (gunsan) return gunsan;
  const first = regions[0];
  if (first) return first;
  return FALLBACK_REGION;
}
