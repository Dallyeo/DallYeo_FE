import type { Achievement } from '@/domain/types';

/**
 * 업적 Repository (V14). 백엔드 `GET /achievements` (be-api-guide-0914 §8.1).
 *
 * 지역별 진행도 엔드포인트는 명세에 없다 — **21종을 한 번에 받아** 화면이 `category`로 나눈다.
 * ⚠️ 코드 접두사로 지역을 판정하면 안 된다(`COMMON`은 지역 무관, §8).
 */
export interface AchievementRepository {
  /** 21종 전체 + 본인 달성 여부. `sortOrder` 오름차순. */
  list(): Promise<Achievement[]>;
}
