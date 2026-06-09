import type { AppSession, Unsubscribe } from '@/domain/types';
import type { SessionChangedPayload } from '@/shared/bridge';
import { bridgeService } from '@/shared/services/BridgeService';
import { apiClient } from '@/shared/api/apiClient';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { logger } from '@/shared/observability/logger';

/**
 * 인증 상태 단일 조율자 (U1-P3/P4, BR-U1-4/5).
 * - bootstrap: 네이티브 주입 세션 복원
 * - sessionChanged 단일 구독 + 401 콜백 등록
 * - invalidate: 무효화 1회 가드 + 부수효과(라우팅/토스트)
 */
export interface SessionSideEffects {
  /** 무효화 시 호출 (V02 라우팅 + 토스트). AppRoot가 주입. */
  onInvalidated: () => void;
}

class SessionServiceImpl {
  private sideEffects: SessionSideEffects | null = null;
  private unsubscribers: Unsubscribe[] = [];

  configure(sideEffects: SessionSideEffects): void {
    this.sideEffects = sideEffects;
  }

  /** 토큰+세션 주입(로그인/부트스트랩 성공) */
  applySession(session: AppSession, token: string): void {
    apiClient.setToken(token);
    useSessionStore.getState().setAuthenticated(session);
  }

  /** 부트스트랩: 네이티브 주입 세션 조회 (BR-U1-5) */
  async bootstrap(): Promise<void> {
    try {
      const session = await bridgeService.getCurrentSession();
      if (session) {
        // 네이티브가 토큰을 별도 주입하지 않는 환경 대비: 세션만 있으면 상태만 인증
        useSessionStore.getState().setAuthenticated(session);
      } else {
        useSessionStore.getState().setUnauthenticated();
      }
    } catch {
      useSessionStore.getState().setUnauthenticated();
    }
  }

  /** 이벤트 구독 + 401 콜백 등록 (U1-P3). AppRoot effect에서 1회 호출. */
  start(): Unsubscribe {
    const offSession = bridgeService.on('sessionChanged', (payload) => {
      const p = payload as SessionChangedPayload;
      if (p.status === 'authenticated' && p.session && p.token) {
        this.applySession(p.session, p.token);
      } else {
        this.invalidate('sessionChanged');
      }
    });
    const offUnauthorized = apiClient.onUnauthorized(() => this.invalidate('http-401'));
    this.unsubscribers = [offSession, offUnauthorized];
    void this.bootstrap();

    return () => {
      this.unsubscribers.forEach((u) => u());
      this.unsubscribers = [];
    };
  }

  /** 무효화 1회 가드 (BR-U1-4). 이미 unauthenticated면 no-op. */
  invalidate(reason: string): void {
    const { status, setUnauthenticated } = useSessionStore.getState();
    if (status === 'unauthenticated') return;
    setUnauthenticated();
    apiClient.clearToken();
    logger.info('session.invalidated', { reason });
    this.sideEffects?.onInvalidated();
  }
}

export const sessionService = new SessionServiceImpl();
