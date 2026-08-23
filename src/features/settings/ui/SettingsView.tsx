import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GateAction } from '@/domain/types';
import { SETTINGS_LINKS } from '@/domain/constants';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { bridgeService } from '@/shared/services/BridgeService';
import { useAuth } from '@/features/login/model/useAuth';
import { useGate } from '@/features/login/model/useGate';
import { AlertDialog } from '@/shared/ui/AlertDialog';
import { toast } from '@/shared/ui/toastStore';
import { sessionService } from '@/shared/auth/SessionService';
import { logger } from '@/shared/observability/logger';
import { profileRepository } from '@/features/settings/api/profileRepository';
import { onboardingRepository } from '@/features/onboarding/api/onboardingRepository';
import { useOnboardingStore } from '@/features/onboarding/model/onboardingStore';
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

  /**
   * 계정 삭제 — `DELETE /users/me`(하드 삭제) 후 **이 기기에 남은 흔적까지** 지우고 온보딩으로.
   *
   * 되돌릴 수 없는 연산의 경계는 `profileRepository.remove()`다. 그게 성공한 뒤로는
   * 계정이 이미 서버에서 사라졌으므로 **뒤따르는 정리 작업이 실패해도 흐름을 막지 않는다** —
   * "삭제 실패" 토스트를 띄우면 사실과 다르고, 사용자가 할 수 있는 일도 없다.
   * 로그아웃도 같은 이유로 best-effort: 브릿지 결과와 무관하게 로컬 세션은 무조건 파기한다
   * (탈퇴 직후의 `POST /auth/logout` 401은 정상이다 — 서버 토큰은 이미 지워졌고,
   *  이 호출의 목적은 네이티브 Keychain을 비우는 것이라 401이어도 달성된다).
   *
   * RootLayout의 온보딩 가드는 마운트 1회만 평가하므로(SPA 내에서 재평가 없음)
   * 플래그 삭제에 기대지 말고 여기서 직접 `/onboarding`으로 보낸다.
   */
  async function deleteAccount(): Promise<void> {
    try {
      await profileRepository.remove();
    } catch (e) {
      // 여기서만 "삭제 실패"가 사실이다 — 계정은 그대로 남아 있다.
      toast.show(e instanceof Error ? e.message : '계정 삭제에 실패했어요.');
      return;
    }

    // ↓ 이 아래는 전부 비차단 정리 작업
    await onboardingRepository.reset();
    useOnboardingStore.getState().reset();
    try {
      await logout();
    } catch (e) {
      logger.warn('[settings] 탈퇴 후 로그아웃 실패(로컬 세션은 파기)', { cause: String(e) });
    } finally {
      // 브릿지가 실패해도 삭제된 계정의 토큰을 들고 남아 있으면 안 된다.
      // logout()이 성공했다면 이미 무효화됐으므로 1회 가드에 걸려 no-op.
      sessionService.invalidate('account-deleted');
    }

    // logout/invalidate가 '로그아웃되었습니다' 토스트 + /main 이동을 먼저 일으키므로
    // 탈퇴 문구와 목적지는 그 뒤에 덮어쓴다.
    toast.show('계정이 삭제되었어요.');
    navigate('/onboarding', { replace: true });
  }

  /** 로그인 필요한 항목: 게이트 통과 시 실행, 아니면 로그인 시트 */
  function runGated(action: GateAction, run: () => void): void {
    if (guard(action)) run();
  }

  return (
    // 네비게이션바 화면은 상단 여백을 줄인다
    <SafeAreaLayout style={{ '--screen-top-gap': '6px' } as CSSProperties}>
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
