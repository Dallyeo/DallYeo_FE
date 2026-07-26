import type { RegionRepository } from '@/domain/repositories';
import type { Region } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';
import { env } from '@/shared/config/env';

/** 공개 API(지역). be-api-spec-recieved-sprint4.md §2 — GET /regions */
export const regionRepository: RegionRepository = {
  listSupported(): Promise<Region[]> {
    return apiClient.get<Region[]>('/regions', { baseUrl: env.publicApiBaseUrl });
  },
};
