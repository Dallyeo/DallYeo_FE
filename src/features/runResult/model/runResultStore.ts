import { create } from 'zustand';
import type { RunCompletedPayload } from '@/domain/types';

/**
 * 완주 결과 transient 저장소 (D2). 'runCompleted' 이벤트 페이로드를 담는다.
 *
 * ⚠️ 담기는 건 **결과 전체가 아니라 runId + 도착 좌표뿐**이다(2026-09-14 계약 변경).
 * 통계·경로 이미지는 `GET /runs/{runId}`로 받아오므로 react-query가 관리하고,
 * 저장 여부(`saved`)는 네이티브 소관이라 여기서 들고 있지 않는다.
 */
interface RunResultState {
  payload: RunCompletedPayload | null;
  setPayload: (payload: RunCompletedPayload) => void;
  clear: () => void;
}

export const useRunResultStore = create<RunResultState>((set) => ({
  payload: null,
  setPayload: (payload) => set({ payload }),
  clear: () => set({ payload: null }),
}));

/** 컴포넌트 밖(리스너)에서 접근 */
export const runResultStore = {
  getState: useRunResultStore.getState,
  setState: useRunResultStore.setState,
};
