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

  getCurrentSession(): Promise<AppSession | null> {
    return bridgeService.getCurrentSession();
  },
};
