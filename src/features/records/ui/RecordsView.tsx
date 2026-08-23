import { useMemo, useState } from 'react';
import type { StatsPeriod } from '@/domain/types';
import { dailyDistances, formatRangeLabel, periodRange, totalDistanceKm } from '@/domain/logic';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useAuth } from '@/features/login/model/useAuth';
import { LoginBanner } from '@/features/login/ui/LoginBanner';
import { useRecords, usePreviousPeriodRecords } from '@/features/records/model/useRecords';
import { PeriodTabs } from './PeriodTabs';
import { ChartCarousel } from './ChartCarousel';
import { RecordCard, RecordListHeader } from './RecordCard';

const PERIOD_NOUN: Record<StatsPeriod, string> = {
  weekly: '저번주',
  monthly: '저번달',
  yearly: '작년',
};

const HEADLINE_SPAN: Record<StatsPeriod, string> = {
  weekly: '최근 7일 동안',
  monthly: '이번 달',
  yearly: '올해',
};

/**
 * V11 기록뷰 (V11_기록_주간 682:1385 / V11_기록_empty 822:5022).
 * 탭(주간/월간/연간)이 **차트와 리스트 모두**에 적용된다(사용자 결정).
 * 통계 엔드포인트가 없어 `GET /runs?from&to` 응답을 프론트에서 집계한다.
 * 월간/연간 그래프는 디자인 미확정 → 카드만 비워 둔다.
 */
export function RecordsView() {
  const { status } = useAuth();
  const isLoggedIn = status === 'authenticated';
  const [period, setPeriod] = useState<StatsPeriod>('weekly');

  // 렌더마다 Date를 새로 만들면 쿼리키가 흔들리므로 마운트 시점으로 고정
  const now = useMemo(() => new Date(), []);
  const range = useMemo(() => periodRange(period, now), [period, now]);
  // 주간 차트는 **항상 이번 주 7일**만 그린다. 선택 기간(월간=31일)으로 계산하면
  // 라벨이 패널 폭을 넘쳐 옆 패널로 흘러나온다.
  const weekRange = useMemo(() => periodRange('weekly', now), [now]);
  const today = useMemo(
    () => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    [now],
  );

  const recordsQuery = useRecords(isLoggedIn, range);
  const prevQuery = usePreviousPeriodRecords(isLoggedIn, period, now);

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="records-view" className="flex min-h-0 flex-1 flex-col">
        <PeriodTabs value={period} onChange={setPeriod} />

        {!isLoggedIn ? (
          <div data-testid="records-login-gate" className="flex flex-col gap-3 p-4">
            <p className="text-body text-gray-500">로그인하면 러닝 기록을 확인할 수 있어요.</p>
            <LoginBanner />
          </div>
        ) : (
          <AsyncBoundary
            query={recordsQuery}
            loadingLabel="기록을 불러오는 중..."
            testId="records"
          >
            {(records) => {
              const total = totalDistanceKm(records);
              const prevTotal = totalDistanceKm(prevQuery.data ?? []);
              const delta = Math.round((total - prevTotal) * 100) / 100;
              const daily = dailyDistances(records, weekRange);

              return (
                <>
                  {/* 헤드라인 — 시안 T143 */}
                  <h1 className="px-4 pt-[34px] text-heading text-black">
                    {records.length === 0
                      ? '아직 달리기 기록이 없어요'
                      : `${HEADLINE_SPAN[period]} 총 ${total}km 달렸어요`}
                  </h1>

                  <p className="flex items-baseline gap-3 px-4 pt-[6px]">
                    <span className="text-body text-black">{PERIOD_NOUN[period]}보다</span>
                    <span data-testid="records-delta" className="text-subheading text-green-700">
                      {delta > 0 ? '+' : ''}
                      {delta}km
                    </span>
                  </p>

                  <p className="pt-[33px] text-center text-body-sm text-gray-500">
                    {formatRangeLabel(range)}
                  </p>

                  {/* 그래프 — 탭 전환 시 가로 슬라이드. 주간만 확정, 월간/연간은 빈 카드 */}
                  <div className="pt-[12px]">
                    <ChartCarousel period={period} daily={daily} today={today} />
                  </div>

                  {/* 기록 리스트 */}
                  {/* 목록은 탭바 바로 위까지 채운다 — 하단 여백을 두면 스크롤 영역이 줄어 마지막 행이 잘려 보인다 */}
                  <section className="mt-[38px] flex min-h-0 flex-1 flex-col px-4">
                    {records.length === 0 ? (
                      <p
                        data-testid="records-empty"
                        className="py-10 text-center text-body text-gray-disabled"
                      >
                        이 기간에는 기록이 없어요.
                      </p>
                    ) : (
                      <>
                        <RecordListHeader />
                        {/* 화면 전체는 고정 — 목록만 내부 스크롤 */}
                        <ul className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                          {records.map((record) => (
                            <li key={record.id}>
                              <RecordCard record={record} />
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </section>
                </>
              );
            }}
          </AsyncBoundary>
        )}
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}
