import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RunRecord, StatsPeriod } from '@/domain/types';
import { periodRange, type PeriodRange } from '@/domain/logic';
import { recordRepository } from '@/features/records/api/recordRepository';

/** 기간 기록 목록 (V11). 로그인 상태에서만 조회. 차트·리스트가 같은 응답을 공유한다. */
export function useRecords(enabled: boolean, range?: PeriodRange) {
  return useQuery<RunRecord[]>({
    queryKey: ['records', range?.from ?? 'all', range?.to ?? 'all'],
    queryFn: () => recordRepository.list(range),
    enabled,
    // 탭 전환 시 이전 데이터를 유지 — 없으면 로딩 스피너가 화면 전체를 갈아치워 깜빡인다
    placeholderData: keepPreviousData,
  });
}

/**
 * 직전 동일 구간 기록 — "저번주보다 N km" 증감 계산용.
 * 통계 엔드포인트가 없어 같은 목록 API를 한 구간 앞으로 한 번 더 호출한다.
 */
export function usePreviousPeriodRecords(enabled: boolean, period: StatsPeriod, now: Date) {
  const prev = periodRange(period, now, -1);
  return useRecords(enabled, prev);
}
