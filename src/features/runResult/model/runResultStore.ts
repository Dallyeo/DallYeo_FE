import { create } from 'zustand';
import type { RunResult } from '@/domain/types';

/**
 * 완주 결과 transient 저장소 (D2). 'runCompleted' 이벤트 데이터를 담는다.
 * fetch가 아니라 이벤트 페이로드이므로 store로 관리. saved는 백엔드 저장 완료 플래그.
 */
interface RunResultState {
  result: RunResult | null;
  saved: boolean;
  setResult: (result: RunResult) => void;
  markSaved: () => void;
  clear: () => void;
}

export const useRunResultStore = create<RunResultState>((set) => ({
  result: null,
  saved: false,
  setResult: (result) => set({ result, saved: false }),
  markSaved: () => set({ saved: true }),
  clear: () => set({ result: null, saved: false }),
}));

/** 컴포넌트 밖(리스너)에서 접근 */
export const runResultStore = {
  getState: useRunResultStore.getState,
  setState: useRunResultStore.setState,
};
