import { useLoginSheetStore } from './loginSheetStore';
import type { GateAction } from '@/domain/types';

export interface UseLoginSheet {
  isOpen: boolean;
  open: (action?: GateAction) => void;
  close: () => void;
}

export function useLoginSheet(): UseLoginSheet {
  const isOpen = useLoginSheetStore((s) => s.isOpen);
  const open = useLoginSheetStore((s) => s.open);
  const close = useLoginSheetStore((s) => s.close);
  return { isOpen, open, close };
}
