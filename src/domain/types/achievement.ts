/**
 * 업적 도메인 타입 (V14). 백엔드 `GET /achievements` 계약(§8.1).
 * 지도(전북 스타일드 이미지)에 업적 달성마다 초록 선이 그려지는 연출은 **기획 미확정** → 이미지만 표시.
 *
 * ⚠️ be-spec-new-260913 §8에서 **8종 → 21종**으로 늘고 `category`/`sortOrder`/`iconOnUrl`/`iconOffUrl`이
 * 추가됐다. V14 본화면 반영은 **다음 라운드**이고, 여기서는 V10 결과창 도장(`newAchievements`)이
 * 필요로 하는 만큼만 **옵셔널로** 열어 둔다 — 기존 8종 목 데이터도 그대로 통과한다.
 */
export interface Achievement {
  /** 업적 코드 (GUNSAN_BEGINNER, JJAMPPONG 등) */
  code: string;
  name: string;
  description: string;
  unlocked: boolean;
  /** 달성 일시 (ISO). 미달성이면 null/undefined */
  unlockedAt?: string | null;
  /** 분류 — `COMMON`은 지역 무관. 코드 접두사로 지역을 판정하면 안 된다(§8) */
  category?: 'GUNSAN' | 'JEONJU' | 'COMMON';
  /** 시안 순서(군산 → 전주 → 공통). 목록은 이미 이 순서로 내려온다 */
  sortOrder?: number;
  /** 획득(컬러) 도장 — API base가 붙은 절대 URL */
  iconOnUrl?: string;
  /** 미획득(흑백) 도장 — API base가 붙은 절대 URL */
  iconOffUrl?: string;
}

/** 업적 지역 탭 — 시안 상단(군산/전주) */
export type AchievementRegion = 'GUNSAN' | 'JEONJU';

export const ACHIEVEMENT_REGIONS: { key: AchievementRegion; label: string }[] = [
  { key: 'GUNSAN', label: '군산' },
  { key: 'JEONJU', label: '전주' },
];

/** 업적 코드 → 지역. 코드 접두사로 판정하며 지역 무관 업적은 없다(고정 8종 기준). */
export function regionOfAchievement(code: string): AchievementRegion {
  return code.startsWith('JEONJU') ? 'JEONJU' : 'GUNSAN';
}
