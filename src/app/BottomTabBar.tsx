import { NavLink, useNavigate } from 'react-router-dom';
import { useGate } from '@/features/login/model/useGate';

/**
 * 하단 탭바 (FR-V02-02) — 메인 / 기록 / 마이페이지. 업적 탭 제외.
 * 기록 탭은 게이트(V02-S2): 비로그인 시 차단 + 로그인 시트. 메인/마이페이지는 자유.
 */
const baseClass = (isActive: boolean) =>
  `flex flex-1 items-center justify-center text-sm ${isActive ? 'text-primary' : 'text-muted'}`;

export function BottomTabBar() {
  const { guard } = useGate();
  const navigate = useNavigate();

  return (
    <nav
      data-testid="bottom-tab-bar"
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface"
      style={{
        height: 'calc(var(--tabbar-height) + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <NavLink to="/main" data-testid="tab-main" className={({ isActive }) => baseClass(isActive)}>
        메인
      </NavLink>
      <button
        type="button"
        data-testid="tab-records"
        onClick={() => {
          if (guard('recordsTab')) navigate('/records');
        }}
        className={baseClass(false)}
      >
        기록
      </button>
      <NavLink
        to="/mypage"
        data-testid="tab-mypage"
        className={({ isActive }) => baseClass(isActive)}
      >
        마이페이지
      </NavLink>
    </nav>
  );
}
