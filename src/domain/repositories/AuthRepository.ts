import type { AppSession, AuthProvider } from '@/domain/types';

/**
 * 인증 Repository (계약). 구현은 U1에서.
 * login은 내부적으로 bridge.login에 위임 — 웹은 OAuth 직접 수행 금지 (NFR-AUTH-01).
 */
export interface AuthRepository {
  login(provider: AuthProvider): Promise<AppSession>;
  logout(): Promise<void>;
  /** 네이티브가 주입한 현재 세션 조회(부트스트랩) */
  getCurrentSession(): Promise<AppSession | null>;
}
