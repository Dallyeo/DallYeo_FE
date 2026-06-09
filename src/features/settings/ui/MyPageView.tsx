import type { GateAction } from '@/domain/types';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { useAuth } from '@/features/login/model/useAuth';
import { useGate } from '@/features/login/model/useGate';
import { LoginBanner } from '@/features/login/ui/LoginBanner';

/**
 * 마이페이지(V13 일부). 본 라운드는 배너 + 게이트 항목 자리만 (FR-V02-04, LOGIN-S3).
 * 설정 본체 기능은 범위 밖.
 */
const ITEMS: { key: string; action: GateAction; label: string }[] = [
  { key: 'profile', action: 'myPageProfile', label: '프로필' },
  { key: 'editInfo', action: 'myPageEditInfo', label: '내 정보 수정' },
  { key: 'account', action: 'myPageAccount', label: '계정 관리' },
];

export function MyPageView() {
  const { status } = useAuth();
  const { guard } = useGate();
  const isLoggedIn = status === 'authenticated';

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="mypage-view" className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-xl">마이페이지</h1>
        {!isLoggedIn && <LoginBanner />}
        <ul className="flex flex-col gap-2">
          {ITEMS.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                data-testid={`mypage-item-${item.key}`}
                onClick={() => guard(item.action)}
                className={`w-full rounded-md border border-border bg-surface px-4 py-3 text-left ${
                  isLoggedIn ? '' : 'opacity-50'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}
