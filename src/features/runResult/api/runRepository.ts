import type { RunRepository } from '@/domain/repositories';
import type { NearbyPlace, RunResult } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';

export const runRepository: RunRepository = {
  listNearbyPlaces(runId: string): Promise<NearbyPlace[]> {
    return apiClient.get<NearbyPlace[]>(`/runs/${encodeURIComponent(runId)}/nearby`);
  },
  saveResult(result: RunResult): Promise<{ recordId: string }> {
    return apiClient.post<{ recordId: string }>('/runs', result);
  },
};
