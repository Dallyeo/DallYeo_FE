import type { RecordRepository } from '@/domain/repositories';
import type { PeriodStats, RunRecord, RunRecordDetail, StatsPeriod } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';

export const recordRepository: RecordRepository = {
  list(): Promise<RunRecord[]> {
    return apiClient.get<RunRecord[]>('/records');
  },
  getById(recordId: string): Promise<RunRecordDetail> {
    return apiClient.get<RunRecordDetail>(`/records/${encodeURIComponent(recordId)}`);
  },
  getStats(period: StatsPeriod): Promise<PeriodStats> {
    return apiClient.get<PeriodStats>(`/records/stats?period=${encodeURIComponent(period)}`);
  },
};
