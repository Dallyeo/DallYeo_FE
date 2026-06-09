import type { RegionRepository } from '@/domain/repositories';
import type { Region } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';

export const regionRepository: RegionRepository = {
  listSupported(): Promise<Region[]> {
    return apiClient.get<Region[]>('/regions');
  },
};
