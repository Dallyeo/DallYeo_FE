import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RunRecordDetail } from '@/domain/types';
import { recordRepository } from '@/features/records/api/recordRepository';

/** 기록 상세 쿼리 정의. 이웃 기록 선로딩(`useRecordPages`)과 **같은 캐시**를 쓰도록 한곳에 둔다. */
export function recordDetailQuery(recordId: string) {
  return {
    queryKey: ['record', recordId] as const,
    queryFn: () => recordRepository.getById(recordId),
  };
}

/** 기록 상세 (V12). recordId 없으면 비활성. */
export function useRecordDetail(recordId: string | undefined) {
  return useQuery<RunRecordDetail>({
    ...recordDetailQuery(recordId as string),
    enabled: !!recordId,
    // 좌우 스와이프로 넘길 때 이전 티켓을 남겨둔다 — 없으면 매번 스피너가 화면을 갈아치운다
    placeholderData: keepPreviousData,
  });
}
