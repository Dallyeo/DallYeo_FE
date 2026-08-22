import type { DailyDistance, StatsPeriod } from '@/domain/types';
import { STATS_PERIODS } from '@/domain/types';
import { WeeklyChart } from './WeeklyChart';

/**
 * 기간 전환 시 차트가 가로로 밀려나는 트랙.
 * 3개 패널을 모두 마운트하고 `translateX(-index * 100%)`로 이동한다 —
 * 월간·연간은 placeholder(데이터 요청 없음)라 동시 마운트 비용이 없다.
 *
 * ⚠️ 수평 **스와이프 제스처는 붙이지 않는다** — iOS 좌측엣지 뒤로가기를 가로채면 안 된다
 *    (CLAUDE.md NFR-WEBVIEW: 수평 스와이프 미탈취). 탭 클릭으로만 전환한다.
 */
export function ChartCarousel({
  period,
  daily,
  today,
}: {
  period: StatsPeriod;
  daily: DailyDistance[];
  today: string;
}) {
  const index = STATS_PERIODS.findIndex((p) => p.key === period);

  return (
    <div className="overflow-hidden">
      <div
        data-testid="chart-track"
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {STATS_PERIODS.map(({ key }) => (
          <div key={key} className="w-full shrink-0 overflow-hidden px-4">
            {key === 'weekly' ? (
              <WeeklyChart daily={daily} today={today} />
            ) : (
              <div
                data-testid="chart-placeholder"
                className="flex h-[195px] items-center justify-center rounded-sm bg-off-white text-body text-gray-disabled shadow-[0_0_4px_rgba(0,0,0,0.15)]"
              >
                그래프 준비중이에요
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
