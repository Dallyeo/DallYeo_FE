import type { RecordRepository } from '@/domain/repositories';
import type { RunRecord, RunRecordDetail } from '@/domain/types';
import type { PeriodRange } from '@/domain/logic';
import { apiClient } from '@/shared/api/apiClient';
import { toAssetUrl } from '@/shared/api/assetUrl';

/**
 * 백엔드 러닝 기록 응답 (be-spec-new-260913 §7.3 목록 / §7.4 상세).
 *
 * ⚠️ 러닝 계열은 **값이 없으면 키 자체가 빠진다**(`null`이 아니다, §1) → 전부 옵셔널.
 * 목록은 경량이라 좌표·코스가 없고, 상세에만 `start`/`end`/`imageUrl`이 들어온다.
 * 폴리라인은 계약에서 사라졌다 — 경로 그림은 네이티브가 올린 `imageUrl`이 대신한다.
 */
interface RunDto {
  id: number | string;
  courseId?: string;
  courseName?: string;
  start?: { lat: number; lng: number };
  end?: { lat: number; lng: number };
  distanceMeters: number;
  durationSeconds: number;
  /** 목록 응답에는 없음 — 거리·시간으로 계산해 채운다 */
  averagePaceSeconds?: number;
  /** 네이티브가 올린 경로 이미지. 서버 기준 절대경로(`/uploads/runs/...`) */
  imageUrl?: string;
  startedAt?: string;
  finishedAt: string;
  /** 네이티브가 저장 때 보낸 값을 서버가 그대로 보관해 돌려준다(서버 계산 아님) */
  calories?: number;
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
    // 목록에도 imageUrl이 온다(§7.3) — 티켓을 미리 그려둘 때 회색 자리로 깜빡이지 않게
    ...(toAssetUrl(d.imageUrl) ? { routeImageUrl: toAssetUrl(d.imageUrl)! } : {}),
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
      ...(d.start ? { start: d.start } : {}),
      ...(d.end ? { end: d.end } : {}),
    };
  },
};
