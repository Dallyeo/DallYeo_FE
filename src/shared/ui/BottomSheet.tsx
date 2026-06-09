import { useEffect, type ReactNode } from 'react';

/**
 * 바텀시트 (NFR-WEBVIEW-04). history 엔트리로 관리 — 좌측 스와이프/뒤로가기로 닫힘.
 * 열릴 때 pushState, popstate(뒤로) 시 onClose. 코드로 닫을 때도 history 정리.
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  testId = 'bottom-sheet',
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const state = { dallyeoSheet: true };
    window.history.pushState(state, '');
    const onPop = () => onClose();
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // 코드로 닫힌 경우(시트 unmount) 우리가 쌓은 history 엔트리 정리
      if (window.history.state?.dallyeoSheet) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid={`${testId}-overlay`}
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        className="w-full rounded-t-lg bg-surface p-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
