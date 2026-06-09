/**
 * 게이트 규칙 (BR-3, FR-V02-03/04, SECURITY-08). 액션 단위 (FD Q6).
 * unknown은 안전하게 차단 측(비로그인처럼) 처리 (FD Q4). myPageTab만 항상 허용.
 */
import type { AuthStatus, GateAction } from '@/domain/types';

/** 인증 없이도 항상 허용되는 액션 */
const ALWAYS_ALLOWED: ReadonlySet<GateAction> = new Set<GateAction>(['myPageTab']);

/** 해당 액션이 현재 인증 상태에서 허용되는지 */
export function isAllowed(status: AuthStatus, action: GateAction): boolean {
  if (ALWAYS_ALLOWED.has(action)) return true;
  return status === 'authenticated';
}
