import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GateAction } from '@/domain/types';
import { SETTINGS_LINKS } from '@/domain/constants';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { bridgeService } from '@/shared/services/BridgeService';
import { useAuth } from '@/features/login/model/useAuth';
import { useGate } from '@/features/login/model/useGate';
import { AlertDialog } from '@/shared/ui/AlertDialog';
import { toast } from '@/shared/ui/toastStore';
import { profileRepository } from '@/features/settings/api/profileRepository';
import { SettingsAppBar } from './SettingsAppBar';
import IcChevron from '@/shared/ui/icons/ic-chevron-forward.svg?react';

/**
 * V13 설정(마이페이지) — 메인 헤더 진입 push. 로그인 필요 항목은 게이트(FR-V13).
 * Figma(V13_설정 618:1110): 앱바(뒤로 40 + 가운데 제목) → 19 → 메뉴 행 370×50 연속.
 * 구분선 gray-250은 **내정보 아래**와 **로그아웃 위** 두 곳뿐(시안 stroke sides).
 * 시안에 프로필 카드·로그인 배너는 없다 — 비로그인은 항목 탭 시 게이트(로그인 시트)로 처리한다.
 */
export function SettingsView() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { guard } = useGate();
  /** 되돌릴 수 없는 동작은 확인 알럿을 거친다 */
  const [confirming, setConfirming] = useState<'logout' | 'delete' | null>(null);

  /** 계정 삭제 — `DELETE /users/me`(하드 삭제) 후 세션 정리하고 메인으로 */
  async function deleteAccount(): Promise<void> {
    try {
      await profileRepository.remove();
      await logout();
      toast.show('계정이 삭제되었어요.');
      navigate('/main', { replace: true });
    } catch (e) {
      toast.show(e instanceof Error ? e.message : '계정 삭제에 실패했어요.');
    }
  }

  /** 로그인 필요한 항목: 게이트 통과 시 실행, 아니면 로그인 시트 */
  function runGated(action: GateAction, run: () => void): void {
    if (guard(action)) run();
  }

  return (
    <SafeAreaLayout>
      <SettingsAppBar title="설정" onBack={() => navigate(-1)} backTestId="settings-back" />

      <main data-testid="settings-view" className="flex flex-1 flex-col pt-[19px]">
        <nav className="flex flex-col">
          <MenuItem
            label="내정보 수정하기"
            chevron
            border="bottom"
            testId="settings-edit-info"
            onClick={() => runGated('myPageEditInfo', () => navigate('/settings/edit'))}
          />
          <MenuItem
            label="문의하기"
            testId="settings-inquiry"
            onClick={() => bridgeService.openExternalUrl(SETTINGS_LINKS.inquiry)}
          />
          <MenuItem
            label="이용약관"
            testId="settings-terms"
            onClick={() => bridgeService.openExternalUrl(SETTINGS_LINKS.terms)}
          />
          <MenuItem
            label="개인정보 보호약관"
            testId="settings-privacy"
            onClick={() => bridgeService.openExternalUrl(SETTINGS_LINKS.privacy)}
          />
          <MenuItem
            label="로그아웃"
            border="top"
            testId="settings-logout"
            onClick={() => runGated('myPageAccount', () => setConfirming('logout'))}
          />
          <MenuItem
            label="계정 삭제"
            danger
            testId="settings-account"
            onClick={() => runGated('myPageAccount', () => setConfirming('delete'))}
          />
        </nav>
      </main>

      <AlertDialog
        isOpen={confirming === 'logout'}
        title="로그아웃 할까요?"
        description="다시 로그인하면 기록을 계속 볼 수 있어요."
        confirmLabel="로그아웃"
        cancelLabel="취소"
        testId="logout-alert"
        onConfirm={() => {
          setConfirming(null);
          void logout();
        }}
        onClose={() => setConfirming(null)}
      />

      <AlertDialog
        isOpen={confirming === 'delete'}
        title="정말 계정을 삭제할까요?"
        description={'러닝 기록과 업적이 모두 사라지고\n되돌릴 수 없어요.'}
        confirmLabel="계정 삭제"
        cancelLabel="취소"
        danger
        testId="delete-account-alert"
        onConfirm={() => {
          setConfirming(null);
          void deleteAccount();
        }}
        onClose={() => setConfirming(null)}
      />
    </SafeAreaLayout>
  );
}

/** 메뉴 행 — 시안: 370×50(gutter16), 라벨 `body-sm`, 우측 chevron 40 영역 */
function MenuItem({
  label,
  chevron = false,
  danger = false,
  border,
  testId,
  onClick,
}: {
  label: string;
  chevron?: boolean;
  danger?: boolean;
  border?: 'top' | 'bottom';
  testId: string;
  onClick: () => void;
}) {
  const borderClass =
    border === 'bottom'
      ? 'border-b border-gray-250'
      : border === 'top'
        ? 'border-t border-gray-250'
        : '';
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={`mx-4 flex h-[50px] items-center justify-between text-left text-body-sm ${
        danger ? 'text-red' : 'text-black'
      } ${borderClass}`}
    >
      <span>{label}</span>
      {chevron && (
        <span aria-hidden className="flex h-10 w-10 items-center justify-end text-black">
          <IcChevron className="h-3 w-auto" />
        </span>
      )}
    </button>
  );
}
