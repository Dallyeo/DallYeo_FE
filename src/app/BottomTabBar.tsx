import { useLocation, useNavigate } from 'react-router-dom';
import { useGate } from '@/features/login/model/useGate';
import type { GateAction } from '@/domain/types';
import IcCourse from '@/shared/ui/icons/ic-add-location-alt.svg?react';
import IcAchievements from '@/shared/ui/icons/ic-steps.svg?react';
import IcRecord from '@/shared/ui/icons/ic-bar-chart.svg?react';

/**
 * 하단 탭바 (FR-V02-02) — 코스 / 업적 / 기록 (Figma 탭 컴포넌트 822:1112 기준).
 * 설정(마이페이지)은 탭바에서 제외 → 메인뷰 우측 상단 햄버거(≡)로 진입.
 * 업적·기록 탭은 게이트(V02-S2): 비로그인 시 차단 + 로그인 시트. 코스(메인)는 자유.
 * 아이콘은 시안 실물(add_location_alt / steps / bar_chart), 라벨 12px.
 * 아이콘 fill=currentColor → 활성 primary / 비활성 subtle 색을 코드가 제어.
 */
interface TabDef {
  to: string;
  label: string;
  testId: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  /** 진입 시 필요한 게이트 액션. 없으면 자유 진입. */
  gate?: GateAction;
}

const TABS: TabDef[] = [
  { to: '/main', label: '코스', testId: 'tab-search', Icon: IcCourse },
  {
    to: '/achievements',
    label: '업적',
    testId: 'tab-achievements',
    Icon: IcAchievements,
    gate: 'achievementsTab',
  },
  { to: '/records', label: '기록', testId: 'tab-records', Icon: IcRecord, gate: 'recordsTab' },
];

export function BottomTabBar() {
  const { guard } = useGate();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      data-testid="bottom-tab-bar"
      // 시안 탭바 그림자: 0 -4px 4px rgba(0,0,0,0.05)
      className="fixed inset-x-0 bottom-0 z-10 flex bg-off-white shadow-[0_-4px_4px_rgba(0,0,0,0.05)]"
      style={{
        height: 'calc(var(--tabbar-height) + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ to, label, testId, Icon, gate }) => {
        const isActive = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <button
            key={to}
            type="button"
            data-testid={testId}
            onClick={() => {
              if (gate && !guard(gate)) return;
              navigate(to);
            }}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${
              isActive ? 'text-green-700' : 'text-gray-disabled'
            }`}
          >
            <Icon aria-hidden className="h-6 w-6" />
            <span className="text-overline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
