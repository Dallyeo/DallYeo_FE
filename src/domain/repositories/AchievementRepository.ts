import type { Achievement } from '@/domain/types';

/**
 * 업적 Repository (V14). 백엔드 `GET /achievements` (backend-api.md §8.1).
 * 지역별 진행도 엔드포인트는 명세에 없다 — 업적 목록을 코드 접두사로 분류해 쓴다.
 */
export interface AchievementRepository {
  /** 고정 8종 + 본인 달성 여부. */
  list(): Promise<Achievement[]>;
}
