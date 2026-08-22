import type { RecordRepository } from '@/domain/repositories';
import type { RunRecord, RunRecordDetail } from '@/domain/types';
import type { PeriodRange } from '@/domain/logic';
import { apiClient } from '@/shared/api/apiClient';

/** 백엔드 러닝 기록 응답 (backend-api.md §7.2 / §7.3) */
interface RunDto {
  id: number | string;
  courseId?: string | null;
  courseName?: string | null;
  distanceMeters: number;
  durationSeconds: number;
  /** 목록 응답에는 없음 — 거리·시간으로 계산해 채운다 */
  averagePaceSeconds?: number;
  startedAt?: string;
  finishedAt: string;
  polyline?: { lat: number; lng: number }[];
  /** ⚠️ 명세에 없는 필드 — 목에서만 온다 */
  calories?: number;
  startPlaceName?: string;
  endPlaceName?: string;
  completionRate?: number;
  staticMapImageUrl?: string;
}

function toRecord(d: RunDto): RunRecord {
  const distanceKm = d.distanceMeters / 1000;
  return {
    id: String(d.id),
    completedAt: d.finishedAt,
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationSec: d.durationSeconds,
    // 목록 응답에 페이스가 없으므로 계산(= 소요시간 / 거리)
    avgPaceSecPerKm:
      d.averagePaceSeconds ?? (distanceKm > 0 ? Math.round(d.durationSeconds / distanceKm) : 0),
    ...(d.calories !== undefined ? { calories: d.calories } : {}),
    ...(d.courseName ? { courseName: d.courseName } : {}),
    ...(d.startedAt ? { startedAt: d.startedAt } : {}),
  };
}

export const recordRepository: RecordRepository = {
  async list(range?: PeriodRange): Promise<RunRecord[]> {
    const qs = range ? `?from=${range.from}&to=${range.to}` : '';
    const rows = await apiClient.get<RunDto[]>(`/runs${qs}`);
    return rows.map(toRecord);
  },
  async getById(recordId: string): Promise<RunRecordDetail> {
    const d = await apiClient.get<RunDto>(`/runs/${encodeURIComponent(recordId)}`);
    return {
      ...toRecord(d),
      completionRate: d.completionRate ?? 0,
      ...(d.startPlaceName ? { startPlaceName: d.startPlaceName } : {}),
      ...(d.endPlaceName ? { endPlaceName: d.endPlaceName } : {}),
      routePolyline: d.polyline ?? [],
      staticMapImageUrl: d.staticMapImageUrl ?? '',
    };
  },
};
