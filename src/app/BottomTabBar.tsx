import { useLocation, useNavigate } from 'react-router-dom';
import { useGate } from '@/features/login/model/useGate';
import type { GateAction } from '@/domain/types';
import IcSearch from '@/shared/ui/icons/ic-search.svg?react';
import IcAchievements from '@/shared/ui/icons/ic-achievements.svg?react';
import IcRecord from '@/shared/ui/icons/ic-record.svg?react';

/**
 * 하단 탭바 (FR-V02-02) — 검색 / 업적 / 기록 (디자인 V02 기준).
 * 설정(마이페이지)은 탭바에서 제외 → 메인뷰 우측 상단 햄버거(≡)로 진입.
 * 업적·기록 탭은 게이트(V02-S2): 비로그인 시 차단 + 로그인 시트. 검색(메인)은 자유.
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
  { to: '/main', label: '검색', testId: 'tab-search', Icon: IcSearch },
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
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface"
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
              isActive ? 'text-primary' : 'text-subtle'
            }`}
          >
            <Icon aria-hidden className="h-6 w-6" />
            <span className="text-m-10">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
