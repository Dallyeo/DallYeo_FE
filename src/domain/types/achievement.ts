/**
 * 업적 도메인 타입 (V14). 백엔드 `GET /achievements` 계약(be-api-guide-0914 §8).
 *
 * ⚠️ 2026-09-15 전면 개편 — **8종 → 21종**으로 늘고 응답에 `category`/`sortOrder`/
 * `iconOnUrl`/`iconOffUrl`이 추가됐다. 화면도 시안이 바뀌었다(지도 + 바텀시트 → 배지 그리드).
 */

/**
 * 업적 분류 = 화면 상단 탭.
 * ⚠️ **`COMMON`은 지역 무관 업적**이다 — 명세가 "코드 접두사로 지역을 판정하면 안 된다"고
 * 못박았다(§8). 예전 `regionOfAchievement(code)`는 그래서 삭제했다. 반드시 이 값으로 분기한다.
 */
export type AchievementCategory = 'GUNSAN' | 'JEONJU' | 'COMMON';

/** 상단 탭 — 시안 V14_업적_1/2/3 순서(군산 → 전주 → 활동) */
export const ACHIEVEMENT_TABS: { key: AchievementCategory; label: string }[] = [
  { key: 'GUNSAN', label: '군산' },
  { key: 'JEONJU', label: '전주' },
  // `COMMON`(지역 무관)의 화면 이름은 "활동"이다 — 시안 V14_업적_3
  { key: 'COMMON', label: '활동' },
];

export interface Achievement {
  /** 업적 코드 (GUNSAN_BEGINNER, JJAMPPONG 등) */
  code: string;
  category: AchievementCategory;
  /** 시안 순서(군산 → 전주 → 공통). 목록은 **이미 이 순서로 정렬돼** 내려온다 */
  sortOrder: number;
  name: string;
  description: string;
  /** 획득(컬러) 배지 — API base가 붙은 절대 URL */
  iconOnUrl: string;
  /** 미획득(흑백) 배지 — API base가 붙은 절대 URL */
  iconOffUrl: string;
  unlocked: boolean;
  /** 달성 일시 (ISO). 미달성이면 null */
  unlockedAt?: string | null;
}
