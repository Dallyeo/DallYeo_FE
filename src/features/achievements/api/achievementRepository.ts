import type { AchievementRepository } from '@/domain/repositories';
import type { Achievement, AchievementCategory } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';
import { toAssetUrl } from '@/shared/api/assetUrl';

/** `GET /achievements` 응답 항목 (be-api-guide-0914 §8.1) */
interface AchievementDto {
  code: string;
  category: AchievementCategory;
  sortOrder: number;
  name: string;
  description: string;
  /** 서버 기준 절대경로 (`/images/achievements/*.webp`) — 조회에 토큰이 필요 없다 */
  iconOnUrl: string;
  iconOffUrl: string;
  unlocked: boolean;
  unlockedAt?: string | null;
}

function toAchievement(d: AchievementDto): Achievement {
  return {
    ...d,
    // 배지 경로는 서버 절대경로라 API base를 붙여야 뜬다 (§8 도장 이미지 / §9-9)
    iconOnUrl: toAssetUrl(d.iconOnUrl) ?? '',
    iconOffUrl: toAssetUrl(d.iconOffUrl) ?? '',
  };
}

export const achievementRepository: AchievementRepository = {
  async list(): Promise<Achievement[]> {
    const rows = await apiClient.get<AchievementDto[]>('/achievements');
    // 서버가 sortOrder 오름차순으로 이미 정렬해 주지만, 화면이 그 약속에 기대지 않게 한 번 더 세운다
    return rows.map(toAchievement).sort((a, b) => a.sortOrder - b.sortOrder);
  },
};
