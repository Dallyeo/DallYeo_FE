import { create } from 'zustand';
import type { GateAction } from '@/domain/types';

/**
 * 로그인 바텀시트 상태 (LOGIN-S1).
 * pendingAction: 게이트로 시트를 연 액션 기억 → 로그인 성공 시 재개(FD Q2=B).
 * 중복 시트 방지: 이미 열려 있으면 pendingAction만 최신으로 갱신.
 */
interface LoginSheetState {
  isOpen: boolean;
  pendingAction: GateAction | null;
  open: (action?: GateAction) => void;
  close: () => void;
  consumePendingAction: () => GateAction | null;
}

export const useLoginSheetStore = create<LoginSheetState>((set, get) => ({
  isOpen: false,
  pendingAction: null,
  open: (action) => set({ isOpen: true, pendingAction: action ?? null }),
  close: () => set({ isOpen: false, pendingAction: null }),
  consumePendingAction: () => {
    const action = get().pendingAction;
    set({ pendingAction: null });
    return action;
  },
}));
