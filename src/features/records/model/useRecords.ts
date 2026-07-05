import { useQuery } from '@tanstack/react-query';
import type { RunRecord } from '@/domain/types';
import { recordRepository } from '@/features/records/api/recordRepository';

/** 기록 목록 (V11). 로그인 상태에서만 조회. */
export function useRecords(enabled: boolean) {
  return useQuery<RunRecord[]>({
    queryKey: ['records'],
    queryFn: () => recordRepository.list(),
    enabled,
  });
}
