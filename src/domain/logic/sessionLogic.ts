/**
 * 세션 상태 전이 로직 (BR-2, LOGIN-S4)
 * 초기 상태는 'unknown' (FD Q4). 순수 함수 — 부수효과 없음.
 */
import type { AuthStatus } from '@/domain/types';

export type AuthEvent = 'login' | 'logout' | 'expire' | 'resolveExists' | 'resolveAbsent';

/**
 * 다음 인증 상태 계산.
 * - login / resolveExists  -> authenticated
 * - logout / expire / resolveAbsent -> unauthenticated
 * 현재 상태와 무관하게 이벤트가 결과를 결정(흡수성). 동일 결과 이벤트 반복은 멱등.
 */
export function nextAuthStatus(_current: AuthStatus, event: AuthEvent): AuthStatus {
  switch (event) {
    case 'login':
    case 'resolveExists':
      return 'authenticated';
    case 'logout':
    case 'expire':
    case 'resolveAbsent':
      return 'unauthenticated';
  }
}
