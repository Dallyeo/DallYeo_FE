import { useQuery } from '@tanstack/react-query';
import type { GeoPoint, NearbyPlace } from '@/domain/types';
import { runRepository } from '@/features/runResult/api/runRepository';

/** 완주 지점 500m 주변 장소 (FR-V10). 좌표가 없으면 비활성. */
export function useNearbyPlaces(endLocation: GeoPoint | undefined) {
  return useQuery<NearbyPlace[]>({
    queryKey: ['nearbyPlaces', endLocation?.lat, endLocation?.lng],
    queryFn: () => runRepository.listNearbyPlaces(endLocation as GeoPoint),
    enabled: !!endLocation,
  });
}
