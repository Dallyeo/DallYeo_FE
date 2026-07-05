import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useAuth } from '@/features/login/model/useAuth';
import { LoginBanner } from '@/features/login/ui/LoginBanner';
import { useRecords } from '@/features/records/model/useRecords';
import { RecordCard } from './RecordCard';

/**
 * V11 기록뷰 (목록). 로그인 필요 — 비로그인 시 배너 + 리스트 차단(FR-V11).
 * 기간 통계/막대그래프(상단 세그먼트+차트)는 MVP3 → 이번 라운드 UI 미구현.
 */
export function RecordsView() {
  const { status } = useAuth();
  const isLoggedIn = status === 'authenticated';
  const recordsQuery = useRecords(isLoggedIn);

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="records-view" className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 pb-10">
        <h1 className="text-b-22 text-text-strong">기록</h1>

        {/* MVP3: 기간 통계(주간/월간/연간/전체) + 막대그래프 자리 — 데이터모델(PeriodStats)만 정의 */}

        {!isLoggedIn ? (
          <div data-testid="records-login-gate" className="flex flex-col gap-3">
            <p className="text-m-15 text-subtle">로그인하면 러닝 기록을 확인할 수 있어요.</p>
            <LoginBanner />
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className="text-m-15 text-text">최근 러닝 기록</h2>
            <AsyncBoundary
              query={recordsQuery}
              isEmpty={(records) => records.length === 0}
              emptyMessage="아직 러닝 기록이 없어요."
              loadingLabel="기록을 불러오는 중..."
              testId="records"
            >
              {(records) => (
                <ul className="flex flex-col gap-3">
                  {records.map((record) => (
                    <li key={record.id}>
                      <RecordCard record={record} />
                    </li>
                  ))}
                </ul>
              )}
            </AsyncBoundary>
          </section>
        )}
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}
