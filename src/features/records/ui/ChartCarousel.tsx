import type { DailyDistance, StatsPeriod } from '@/domain/types';
import { STATS_PERIODS } from '@/domain/types';
import type { MonthlyDistance } from '@/domain/logic';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyChart } from './MonthlyChart';
import { YearlyChart } from './YearlyChart';

/**
 * 기간 전환 시 차트가 가로로 밀려나는 트랙.
 * 3개 패널을 모두 마운트하고 `translateX(-index * 100%)`로 이동한다.
 *
 * 끄는 중에는 `dragPx`만큼 손끝을 따라오고, 손을 떼면 `period`가 바뀌며 제자리로 붙는다.
 * (수평 스와이프 감지는 화면 전체를 덮는 `RecordsView`가 맡는다 — 좌측 엣지 뒤로가기는
 * `useHorizontalSwipe`가 양보하므로 iOS 뒤로가기를 막지 않는다.)
 */
export function ChartCarousel({
  period,
  daily,
  monthlyDaily,
  monthly,
  today,
  currentMonth,
  dragPx = 0,
  isDragging = false,
}: {
  period: StatsPeriod;
  /** 주간 차트용 — 보고 있는 주의 7일 */
  daily: DailyDistance[];
  /** 월간 차트용 — 보고 있는 달의 일별 거리 */
  monthlyDaily: DailyDistance[];
  /** 연간 차트용 — 보고 있는 해의 월별 거리 */
  monthly: MonthlyDistance[];
  today: string;
  currentMonth?: number | undefined;
  dragPx?: number;
  isDragging?: boolean;
}) {
  const index = STATS_PERIODS.findIndex((p) => p.key === period);

  return (
    <div className="overflow-hidden">
      <div
        data-testid="chart-track"
        className="flex"
        style={{
          transform: `translateX(calc(-${index * 100}% + ${dragPx}px))`,
          transition: isDragging ? undefined : 'transform 300ms ease-out',
        }}
      >
        {STATS_PERIODS.map(({ key }) => (
          <div key={key} className="w-full shrink-0 overflow-hidden px-4">
            {key === 'weekly' && <WeeklyChart daily={daily} today={today} />}
            {key === 'monthly' && <MonthlyChart daily={monthlyDaily} today={today} />}
            {key === 'yearly' && <YearlyChart monthly={monthly} currentMonth={currentMonth} />}
          </div>
        ))}
      </div>
    </div>
  );
}
