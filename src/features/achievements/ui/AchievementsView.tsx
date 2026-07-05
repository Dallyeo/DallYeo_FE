import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { useAuth } from '@/features/login/model/useAuth';
import { LoginBanner } from '@/features/login/ui/LoginBanner';

/**
 * V14 업적 — 기획 보류. 이번 라운드는 **placeholder만**(데이터모델/리포지토리만 구현).
 * 전북 스타일드 SVG 지도 + 업적 리스트 UI는 후속.
 */
export function AchievementsView() {
  const { status } = useAuth();
  const isLoggedIn = status === 'authenticated';

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="achievements-view" className="flex flex-1 flex-col gap-4 p-5">
        <h1 className="text-b-22 text-text-strong">업적</h1>

        {!isLoggedIn ? (
          <div data-testid="achievements-login-gate" className="flex flex-col gap-3">
            <p className="text-m-15 text-subtle">로그인하면 업적을 확인할 수 있어요.</p>
            <LoginBanner />
          </div>
        ) : (
          <div
            data-testid="achievements-placeholder"
            className="flex flex-1 flex-col items-center justify-center gap-2 text-center"
          >
            <p className="text-m-15 text-text">업적 기능을 준비하고 있어요.</p>
            <p className="text-m-12 text-subtle">전북 지도와 업적 목록이 곧 추가됩니다.</p>
          </div>
        )}
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}
