import type { RunRecord, RunRecordDetail } from '@/domain/types';
import type { PeriodRange } from '@/domain/logic';

/**
 * 기록 Repository (계약, V11/V12). 백엔드 `GET /runs?from&to` / `GET /runs/{id}`.
 * 통계 전용 엔드포인트는 없다 — 구간 기록을 받아 **프론트에서 집계**한다(domain/logic/periodStats).
 */
export interface RecordRepository {
  /** 구간 기록 목록(최신순). range 생략 시 전체. 빈 배열 가능(Empty 상태). */
  list(range?: PeriodRange): Promise<RunRecord[]>;
  /** 기록 상세(V12). */
  getById(recordId: string): Promise<RunRecordDetail>;
}
