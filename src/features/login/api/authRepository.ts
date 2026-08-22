import type { AuthRepository } from '@/domain/repositories';
import type { AppSession, AuthProvider } from '@/domain/types';
import { bridgeService } from '@/shared/services/BridgeService';
import { sessionService } from '@/shared/auth/SessionService';
import { BridgeError } from '@/shared/bridge';
import { logger } from '@/shared/observability/logger';

/**
 * AuthRepository 구현 (BR-U1-1).
 * bridge.login 위임 → { session, token } → token=apiClient, session=store 분리 주입(FD Q1=A).
 */
export const authRepository: AuthRepository = {
  async login(provider: AuthProvider): Promise<AppSession> {
    const result = await bridgeService.login(provider);
    // 네이티브가 "성공"을 로그로 남겨도 **페이로드 형태가 계약과 다르면** 웹은 로그인할 수 없다.
    // 어떤 값이 왔는지 콘솔에 남겨 iOS/Android 쪽에서 바로 비교할 수 있게 한다(BRIDGE.md §2).
    const session = result?.session;
    const token = result?.token;
    if (!session?.userId || !token) {
      logger.error('[bridge.login] 계약 불일치 — { session:{userId}, token } 이어야 함', {
        받은키: result ? Object.keys(result) : null,
        sessionKeys: session ? Object.keys(session) : null,
        hasToken: Boolean(token),
      });
      throw new BridgeError(
        'failed',
        '로그인 응답 형식이 올바르지 않아요. (session.userId / token 누락)',
      );
    }
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
