/**
 * 완주율 메시지 로직 (FR-V10, BR). 완주율(%) → 티어 → 스펙 문구.
 * 경계: rate >= 100 complete · 50 <= rate < 100 half · rate < 50 low.
 * 방어적으로 [0,100] 밖 값도 티어로 매핑(음수→low, 100 초과→complete).
 */
import type { CompletionTier } from '@/domain/types';
import {
  COMPLETION_MESSAGE,
  COMPLETION_HALF_MIN,
  COMPLETION_COMPLETE_MIN,
} from '@/domain/constants';

export function resolveCompletionTier(completionRate: number): CompletionTier {
  if (completionRate >= COMPLETION_COMPLETE_MIN) return 'complete';
  if (completionRate >= COMPLETION_HALF_MIN) return 'half';
  return 'low';
}

export function completionMessage(completionRate: number): string {
  return COMPLETION_MESSAGE[resolveCompletionTier(completionRate)];
}
