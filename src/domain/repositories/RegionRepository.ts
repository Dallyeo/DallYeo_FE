import type { Region } from '@/domain/types';

/** 지역 Repository (계약). 지원 지역 목록은 동적 조회 (NFR-DATA-02). 구현은 U3에서. */
export interface RegionRepository {
  listSupported(): Promise<Region[]>;
}
