import { useQuery } from '@tanstack/react-query';
import type { RunRecordDetail } from '@/domain/types';
import { recordRepository } from '@/features/records/api/recordRepository';

/** 기록 상세 (V12). recordId 없으면 비활성. */
export function useRecordDetail(recordId: string | undefined) {
  return useQuery<RunRecordDetail>({
    queryKey: ['record', recordId],
    queryFn: () => recordRepository.getById(recordId as string),
    enabled: !!recordId,
  });
}
