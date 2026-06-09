import { useCallback } from 'react';
import type { AppSession, AuthProvider, AuthStatus } from '@/domain/types';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { authRepository } from '@/features/login/api/authRepository';

/**
 * 로그인 in-flight 단일화 (U1-P5): 진행 중이면 동일 promise 재사용 → 연타/동시 호출 무시.
 */
let inflightLogin: Promise<AppSession> | null = null;

export interface UseAuth {
  status: AuthStatus;
  session: AppSession | null;
  login: (provider: AuthProvider) => Promise<AppSession>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuth {
  const status = useSessionStore((s) => s.status);
  const session = useSessionStore((s) => s.session);

  const login = useCallback((provider: AuthProvider): Promise<AppSession> => {
    if (inflightLogin) return inflightLogin;
    inflightLogin = authRepository.login(provider).finally(() => {
      inflightLogin = null;
    });
    return inflightLogin;
  }, []);

  const logout = useCallback((): Promise<void> => authRepository.logout(), []);

  return { status, session, login, logout };
}
