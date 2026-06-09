import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Region } from '@/domain/types';
import { resolveDefaultRegion } from '@/domain/logic';
import { regionRepository } from '@/features/main/api/regionRepository';
import { useRegionStore } from './regionStore';

/** 지원 지역 목록 조회 */
export function useRegions() {
  return useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: () => regionRepository.listSupported(),
  });
}

/** 선택 지역 + 목록 로드 시 기본 지역 보정(군산 우선) */
export function useSelectedRegion() {
  const region = useRegionStore((s) => s.region);
  const setRegion = useRegionStore((s) => s.setRegion);
  const { data } = useRegions();

  useEffect(() => {
    if (data && data.length > 0) {
      setRegion(resolveDefaultRegion(data));
    }
  }, [data, setRegion]);

  return { region, setRegion, regions: data ?? [] };
}
