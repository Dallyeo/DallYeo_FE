import { useEffect, type ReactNode } from 'react';

/**
 * 공용 알럿/확인 다이얼로그.
 * 코스정보 팝업과 같은 중앙 모달 규격(좌우 gutter 26, r8, 내부 25/20)에 맞춘다.
 * 뒤로가기로 닫히도록 history 엔트리를 쌓는다(NFR-WEBVIEW-04).
 */
export function AlertDialog({
  isOpen,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel,
  danger = false,
  onConfirm,
  onClose,
  testId = 'alert-dialog',
}: {
  isOpen: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  /** 주면 취소 버튼이 함께 노출된다(확인 다이얼로그) */
  cancelLabel?: string;
  /** 파괴적 동작(계정 삭제 등) — 확인 버튼을 red로 */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  testId?: string;
}) {
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ dallyeoAlert: true }, '');
    const onPop = () => onClose();
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (window.history.state?.dallyeoAlert) window.history.back();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid={`${testId}-overlay`}
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-dim px-[26px]"
      onClick={onClose}
    >
      <div
        data-testid={testId}
        role="alertdialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className="w-full rounded-md bg-surface px-[25px] pb-5 pt-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-subheading text-gray-900">{title}</p>
        {description && (
          <p className="mt-[10px] whitespace-pre-line text-center text-body-sm text-gray-500">
            {description}
          </p>
        )}

        <div className="mt-6 flex gap-[10px]">
          {cancelLabel && (
            <button
              type="button"
              data-testid={`${testId}-cancel`}
              onClick={onClose}
              className="h-[47px] flex-1 rounded-md bg-gray-200 text-label text-gray-700"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            data-testid={`${testId}-confirm`}
            onClick={onConfirm}
            className={`h-[47px] flex-1 rounded-md text-label text-white ${
              danger ? 'bg-red' : 'bg-green-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
