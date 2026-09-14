import { useQuery } from '@tanstack/react-query';
import type { GeoPoint, NearbyPlace } from '@/domain/types';
import { runRepository } from '@/features/runResult/api/runRepository';

/**
 * 완주 지점 500m 주변 장소 (FR-V10).
 * 좌표는 'runCompleted' 페이로드에서 바로 오므로 `GET /runs/{id}`를 기다리지 않는다.
 */
export function useNearbyPlaces(end: GeoPoint | undefined) {
  return useQuery<NearbyPlace[]>({
    queryKey: ['nearbyPlaces', end?.lat, end?.lng],
    queryFn: () => runRepository.listNearbyPlaces(end as GeoPoint),
    enabled: !!end,
  });
}
