import { useMemo, useState } from 'react';
import type { StatsPeriod } from '@/domain/types';
import { STATS_PERIODS } from '@/domain/types';
import {
  dailyDistances,
  formatPeriodLabel,
  monthlyDistances,
  periodRange,
  sortByLatest,
  totalDistanceKm,
} from '@/domain/logic';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { BottomTabBar } from '@/app/BottomTabBar';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { useHorizontalSwipe } from '@/shared/ui/useHorizontalSwipe';
import { useAuth } from '@/features/login/model/useAuth';
import { LoginBanner } from '@/features/login/ui/LoginBanner';
import { useRecords } from '@/features/records/model/useRecords';
import { PeriodTabs } from './PeriodTabs';
import { PeriodNavigator } from './PeriodNavigator';
import { ChartCarousel } from './ChartCarousel';
import { RecordCard, RecordListHeader } from './RecordCard';

const PERIOD_NOUN: Record<StatsPeriod, string> = {
  weekly: '저번주',
  monthly: '저번달',
  yearly: '작년',
};

/**
 * 헤드라인 앞머리. 과거 구간을 봐도 **문구는 고정**이다(2026-09-13 사용자 결정) —
 * 어느 구간을 보고 있는지는 바로 아래 `PeriodNavigator`가 날짜로 알려준다.
 */
const HEADLINE_SPAN: Record<StatsPeriod, string> = {
  weekly: '이번 주',
  monthly: '이번 달',
  yearly: '이번 해',
};

/**
 * V11 기록뷰 (시안 최신본 `주간`/`월간`/`연간` 988:2063·2339·2194).
 *
 * 기간 탭(주간/월간/연간)이 **차트와 리스트 모두**에 적용된다(사용자 결정).
 * 전환 수단은 두 가지 — 탭을 누르거나 **화면을 좌우로 스와이프**한다.
 * 탭 아래 화살표는 **같은 단위 안에서 구간을 앞뒤로** 옮긴다(지난주 / 지난달 / 작년).
 *
 * 통계 엔드포인트가 없어 `GET /runs?from&to` 응답을 프론트에서 집계한다.
 */
export function RecordsView() {
  const { status } = useAuth();
  const isLoggedIn = status === 'authenticated';
  const [period, setPeriod] = useState<StatsPeriod>('weekly');
  /** 선택 구간이 현재에서 몇 칸 과거인지 (0 = 이번 주/달/해) */
  const [offset, setOffset] = useState(0);

  // 렌더마다 Date를 새로 만들면 쿼리키가 흔들리므로 마운트 시점으로 고정
  const now = useMemo(() => new Date(), []);
  const range = useMemo(() => periodRange(period, now, offset), [period, now, offset]);
  const prevRange = useMemo(() => periodRange(period, now, offset - 1), [period, now, offset]);
  const today = useMemo(
    () =>
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    [now],
  );

  // 기간 단위를 바꾸면 구간은 현재로 되돌린다 — "3주 전"과 "3달 전"은 같은 뜻이 아니다
  function changePeriod(next: StatsPeriod): void {
    setPeriod(next);
    setOffset(0);
  }

  const periodIndex = STATS_PERIODS.findIndex((p) => p.key === period);
  const stepPeriod = (delta: number) => {
    const next = STATS_PERIODS[periodIndex + delta];
    if (next) changePeriod(next.key);
  };
  const swipe = useHorizontalSwipe({
    // 손가락을 왼쪽으로 = 오른쪽 탭(주간→월간→연간)
    onSwipeLeft: periodIndex < STATS_PERIODS.length - 1 ? () => stepPeriod(1) : undefined,
    onSwipeRight: periodIndex > 0 ? () => stepPeriod(-1) : undefined,
    enabled: isLoggedIn,
  });

  const recordsQuery = useRecords(isLoggedIn, range);
  const prevQuery = useRecords(isLoggedIn, prevRange);

  // 차트 3종은 **선택 구간의 시작일**을 기준으로 각자의 범위를 그린다
  // (예: 2026년 6월을 보는 중이면 주간 패널도 그 달 첫 주를 그린다).
  const anchor = useMemo(() => new Date(`${range.from}T00:00:00`), [range.from]);

  return (
    <SafeAreaLayout withTabBar>
      <main data-testid="records-view" className="flex min-h-0 flex-1 flex-col">
        <PeriodTabs value={period} onChange={changePeriod} />

        {!isLoggedIn ? (
          <div data-testid="records-login-gate" className="flex flex-col gap-3 p-4">
            <p className="text-body text-gray-500">로그인하면 러닝 기록을 확인할 수 있어요.</p>
            <LoginBanner />
          </div>
        ) : (
          <AsyncBoundary query={recordsQuery} loadingLabel="기록을 불러오는 중..." testId="records">
            {(records) => {
              const total = totalDistanceKm(records);
              const prevTotal = totalDistanceKm(prevQuery.data ?? []);
              const delta = Math.round((total - prevTotal) * 100) / 100;
              // 목록은 **최신순**. 백엔드 정렬을 믿지 않고 프론트에서 한 번 더 맞춘다.
              const sorted = sortByLatest(records);

              return (
                // 가로 스와이프는 화면 전체에서 받는다. `pan-y`로 세로 스크롤은 브라우저에 남긴다.
                <div
                  data-testid="records-swipe"
                  {...swipe.handlers}
                  style={{ touchAction: 'pan-y' }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  {/* 헤드라인 — 시안 Frame 357 */}
                  <h1 className="px-4 pt-[30px] text-heading text-black">
                    {records.length === 0
                      ? '아직 달리기 기록이 없어요'
                      : `${HEADLINE_SPAN[period]} 총 ${total}km 달렸어요`}
                  </h1>

                  <p className="flex items-baseline gap-3 px-4 pt-[5px]">
                    <span className="text-body text-black">{PERIOD_NOUN[period]}보다</span>
                    <span data-testid="records-delta" className="text-subheading text-green-700">
                      {delta > 0 ? '+' : ''}
                      {delta}km
                    </span>
                  </p>

                  {/* 기간 이동 — 시안 Frame 358 (y=240) */}
                  <div className="pt-[36px]">
                    <PeriodNavigator
                      label={formatPeriodLabel(period, range)}
                      onPrev={() => setOffset((o) => o - 1)}
                      onNext={() => setOffset((o) => Math.min(0, o + 1))}
                      canGoNext={offset < 0}
                    />
                  </div>

                  {/* 그래프 — 탭/스와이프 전환 시 가로 슬라이드 */}
                  <div className="pt-[2px]">
                    <ChartCarousel
                      period={period}
                      daily={dailyDistances(records, periodRange('weekly', anchor))}
                      monthlyDaily={dailyDistances(records, periodRange('monthly', anchor))}
                      monthly={monthlyDistances(records, anchor.getFullYear())}
                      today={today}
                      currentMonth={
                        anchor.getFullYear() === now.getFullYear() ? now.getMonth() + 1 : undefined
                      }
                      dragPx={swipe.dx}
                      isDragging={swipe.isSwiping}
                    />
                  </div>

                  {/* 기록 리스트 */}
                  {/* 목록은 탭바 바로 위까지 채운다 — 하단 여백을 두면 스크롤 영역이 줄어 마지막 행이 잘려 보인다 */}
                  <section className="mt-[35px] flex min-h-0 flex-1 flex-col px-4">
                    {sorted.length === 0 ? (
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
                          {sorted.map((record) => (
                            <li key={record.id}>
                              <RecordCard record={record} />
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </section>
                </div>
              );
            }}
          </AsyncBoundary>
        )}
      </main>
      <BottomTabBar />
    </SafeAreaLayout>
  );
}
