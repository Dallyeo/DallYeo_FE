import { useNavigate } from 'react-router-dom';
import type { GateAction } from '@/domain/types';
import { SETTINGS_LINKS } from '@/domain/constants';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { bridgeService } from '@/shared/services/BridgeService';
import { useAuth } from '@/features/login/model/useAuth';
import { useGate } from '@/features/login/model/useGate';
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

  /** 로그인 필요한 항목: 게이트 통과 시 실행, 아니면 로그인 시트 */
  function runGated(action: GateAction, run: () => void): void {
    if (guard(action)) run();
  }

  return (
    <SafeAreaLayout>
      <SettingsAppBar title="설정" onBack={() => navigate(-1)} backTestId="settings-back" />

      <main data-testid="settings-view" className="flex flex-1 flex-col overflow-y-auto pt-[19px]">
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
            onClick={() => runGated('myPageAccount', () => void logout())}
          />
          <MenuItem
            label="계정 삭제"
            danger
            testId="settings-account"
            onClick={() => runGated('myPageAccount', () => navigate('/settings/account'))}
          />
        </nav>
      </main>
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
