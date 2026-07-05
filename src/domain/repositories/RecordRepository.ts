import type { PeriodStats, RunRecord, RunRecordDetail, StatsPeriod } from '@/domain/types';

/**
 * 기록 Repository (계약, V11/V12). 구현은 U5에서(백엔드/MSW).
 * getStats는 MVP3용 — 인터페이스만 예약, 현재 UI 미사용.
 */
export interface RecordRepository {
  /** 기록 목록. 빈 배열 가능(Empty 상태). */
  list(): Promise<RunRecord[]>;
  /** 기록 상세(V12). */
  getById(recordId: string): Promise<RunRecordDetail>;
  /** 기간 통계 (MVP3 — 예약). */
  getStats(period: StatsPeriod): Promise<PeriodStats>;
}
