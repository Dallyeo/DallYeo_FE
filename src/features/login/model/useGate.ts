import { useCallback } from 'react';
import type { GateAction } from '@/domain/types';
import { isAllowed } from '@/domain/logic';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from './loginSheetStore';

export interface UseGate {
  /** 허용되면 true 반환(진행), 비로그인 차단이면 로그인 시트 오픈 후 false 반환 (BR-U1-3) */
  guard: (action: GateAction) => boolean;
}

export function useGate(): UseGate {
  const open = useLoginSheetStore((s) => s.open);

  const guard = useCallback(
    (action: GateAction): boolean => {
      const status = useSessionStore.getState().status;
      if (isAllowed(status, action)) return true;
      open(action);
      return false;
    },
    [open],
  );

  return { guard };
}
