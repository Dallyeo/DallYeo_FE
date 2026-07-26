import type { AuthRepository } from '@/domain/repositories';
import type { AppSession, AuthProvider } from '@/domain/types';
import { bridgeService } from '@/shared/services/BridgeService';
import { sessionService } from '@/shared/auth/SessionService';

/**
 * AuthRepository 구현 (BR-U1-1).
 * bridge.login 위임 → { session, token } → token=apiClient, session=store 분리 주입(FD Q1=A).
 */
export const authRepository: AuthRepository = {
  async login(provider: AuthProvider): Promise<AppSession> {
    const { session, token } = await bridgeService.login(provider);
    sessionService.applySession(session, token);
    return session;
  },

  async logout(): Promise<void> {
    await bridgeService.logout();
    sessionService.invalidate('user-logout');
  },

  // 도메인 계약은 토큰을 노출하지 않는다 — 세션 메타만 반환. 토큰 복원은 SessionService.bootstrap 담당.
  async getCurrentSession(): Promise<AppSession | null> {
    const result = await bridgeService.getCurrentSession();
    return result?.session ?? null;
  },
};
