import type { AchievementRepository } from '@/domain/repositories';
import type { Achievement, RegionProgress } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';

export const achievementRepository: AchievementRepository = {
  list(): Promise<Achievement[]> {
    return apiClient.get<Achievement[]>('/achievements');
  },
  getRegionProgress(): Promise<RegionProgress[]> {
    return apiClient.get<RegionProgress[]>('/achievements/regions');
  },
};
