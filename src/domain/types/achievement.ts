/**
 * 업적 도메인 타입 (V14). 백엔드 `GET /achievements` 계약(backend-api.md §8.1) — 고정 8종.
 * 지도(전북 스타일드 이미지)에 업적 달성마다 초록 선이 그려지는 연출은 **기획 미확정** → 이미지만 표시.
 */
export interface Achievement {
  /** 업적 코드 (GUNSAN_BEGINNER, JJAMPPONG 등) */
  code: string;
  name: string;
  description: string;
  unlocked: boolean;
  /** 달성 일시 (ISO). 미달성이면 null/undefined */
  unlockedAt?: string | null;
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
