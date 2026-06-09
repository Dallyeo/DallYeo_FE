import { create } from 'zustand';
import type { AppSession, AuthStatus } from '@/domain/types';

/**
 * 인증 단일 출처 (NFR-AUTH-03, NFR-U1-SEC-11).
 * 토큰은 여기 두지 않는다 — apiClient 클로저 보관(NFR-U1-SEC-12a).
 */
interface SessionState {
  status: AuthStatus;
  session: AppSession | null;
  setAuthenticated: (session: AppSession) => void;
  setUnauthenticated: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'unknown',
  session: null,
  setAuthenticated: (session) => set({ status: 'authenticated', session }),
  setUnauthenticated: () => set({ status: 'unauthenticated', session: null }),
}));

/** 컴포넌트 밖(서비스)에서 현재 상태 읽기 */
export const sessionStore = {
  getState: useSessionStore.getState,
  setState: useSessionStore.setState,
};
