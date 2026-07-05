import { RUN_RESULT_LEAVE_LOGIN_CONFIRM } from '@/domain/constants';
import { Button } from '@/shared/ui';

/**
 * 비로그인 이탈 확인 팝업 (FR-V10, 스펙 정확 copy).
 * '로그인' → 로그인 시트 오픈(성공 시 저장), '저장 안 함' → 저장 없이 이동.
 */
export function LeaveConfirmDialog({
  onLogin,
  onLeave,
  onClose,
}: {
  onLogin: () => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  return (
    <div
      data-testid="leave-confirm-dialog"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-xs flex-col gap-4 rounded-xl bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-m-15 text-text-strong">{RUN_RESULT_LEAVE_LOGIN_CONFIRM}</p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            data-testid="leave-without-save"
            onClick={onLeave}
          >
            저장 안 함
          </Button>
          <Button className="flex-1" data-testid="leave-login" onClick={onLogin}>
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
}
