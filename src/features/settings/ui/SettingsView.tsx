import { useNavigate } from 'react-router-dom';
import type { GateAction, UserProfile } from '@/domain/types';
import { SETTINGS_LINKS } from '@/domain/constants';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { bridgeService } from '@/shared/services/BridgeService';
import { useAuth } from '@/features/login/model/useAuth';
import { useGate } from '@/features/login/model/useGate';
import { LoginBanner } from '@/features/login/ui/LoginBanner';
import { useProfile } from '@/features/settings/model/useProfile';
import { ProfileCard } from './ProfileCard';

/**
 * V13 설정(마이페이지) — 메인 헤더 진입 push. 로그인 필요(FR-V13).
 * 비로그인: 프로필 카드 대신 로그인 배너 + 게이트 항목. 문의/약관은 로그인 불필요.
 */
export function SettingsView() {
  const navigate = useNavigate();
  const { status } = useAuth();
  const { guard } = useGate();
  const isLoggedIn = status === 'authenticated';
  const profileQuery = useProfile(isLoggedIn);

  /** 로그인 필요한 항목: 게이트 통과 시 이동, 아니면 로그인 시트 */
  function goGated(action: GateAction, to: string): void {
    if (guard(action)) navigate(to);
  }

  return (
    <SafeAreaLayout>
      <header className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          data-testid="settings-back"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="text-sb-20 text-text-strong"
        >
          ‹
        </button>
        <h1 className="flex-1 text-center text-m-15 text-text-strong">설정</h1>
        <span className="w-5" aria-hidden />
      </header>

      <main data-testid="settings-view" className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 pb-10">
        {isLoggedIn ? (
          <AsyncBoundary query={profileQuery} loadingLabel="프로필을 불러오는 중..." testId="profile">
            {(profile: UserProfile) => <ProfileCard profile={profile} />}
          </AsyncBoundary>
        ) : (
          <LoginBanner />
        )}

        <nav className="flex flex-col">
          <MenuItem
            label="내정보 수정하기"
            chevron
            testId="settings-edit-info"
            onClick={() => goGated('myPageEditInfo', '/settings/edit')}
            enabled={isLoggedIn}
          />
          <Divider />
          <MenuItem
            label="문의하기"
            testId="settings-inquiry"
            onClick={() => bridgeService.openExternalUrl(SETTINGS_LINKS.inquiry)}
            enabled
          />
          <MenuItem
            label="이용약관"
            testId="settings-terms"
            onClick={() => bridgeService.openExternalUrl(SETTINGS_LINKS.terms)}
            enabled
          />
          <MenuItem
            label="개인정보 보호약관"
            testId="settings-privacy"
            onClick={() => bridgeService.openExternalUrl(SETTINGS_LINKS.privacy)}
            enabled
          />
          <Divider />
          <MenuItem
            label="계정관리"
            chevron
            testId="settings-account"
            onClick={() => goGated('myPageAccount', '/settings/account')}
            enabled={isLoggedIn}
          />
        </nav>
      </main>
    </SafeAreaLayout>
  );
}

function MenuItem({
  label,
  chevron = false,
  enabled,
  testId,
  onClick,
}: {
  label: string;
  chevron?: boolean;
  enabled: boolean;
  testId: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={`flex items-center justify-between py-4 text-left text-m-15 text-text-strong ${
        enabled ? '' : 'opacity-50'
      }`}
    >
      <span>{label}</span>
      {chevron && <span aria-hidden className="text-subtle">›</span>}
    </button>
  );
}

function Divider() {
  return <hr className="border-border" />;
}
