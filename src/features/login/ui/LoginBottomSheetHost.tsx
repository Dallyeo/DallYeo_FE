import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useLoginSheet } from '@/features/login/model/useLoginSheet';
import { LoginBottomSheet } from './LoginBottomSheet';

/**
 * 전역 로그인 시트 호스트. loginSheetStore.isOpen 구독 (LOGIN-S1).
 */
export function LoginBottomSheetHost() {
  const { isOpen, close } = useLoginSheet();
  return (
    <BottomSheet isOpen={isOpen} onClose={close} testId="login-bottom-sheet">
      <LoginBottomSheet />
    </BottomSheet>
  );
}
