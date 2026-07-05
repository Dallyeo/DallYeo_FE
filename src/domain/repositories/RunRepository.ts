import type { NearbyPlace, RunResult } from '@/domain/types';

/**
 * 완주 결과 Repository (계약, V10). 구현은 U4에서(백엔드/MSW).
 * 완주 결과 자체는 네이티브 'runCompleted' 이벤트로 수신하고,
 * 주변 장소/저장만 백엔드를 경유한다.
 */
export interface RunRepository {
  /** 완주 위치(500m) 주변 장소. 빈 배열 가능(Empty 상태). */
  listNearbyPlaces(runId: string): Promise<NearbyPlace[]>;
  /** 완주 결과 저장 — 로그인 상태에서만 호출(비로그인 저장 X). 저장된 기록 id 반환. */
  saveResult(result: RunResult): Promise<{ recordId: string }>;
}
