import { useQuery } from '@tanstack/react-query';
import type { NearbyPlace } from '@/domain/types';
import { runRepository } from '@/features/runResult/api/runRepository';

/** 완주 위치 500m 주변 장소 조회 (FR-V10). runId 없으면 비활성. */
export function useNearbyPlaces(runId: string | undefined) {
  return useQuery<NearbyPlace[]>({
    queryKey: ['nearbyPlaces', runId],
    queryFn: () => runRepository.listNearbyPlaces(runId as string),
    enabled: !!runId,
  });
}
