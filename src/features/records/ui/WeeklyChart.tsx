import type { DailyDistance } from '@/domain/types';
import { chartScaleMax } from '@/domain/logic';
import { CHART_BASELINE, CHART_PLOT, ChartAxis, ChartCard } from './ChartCard';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * V11 주간 막대그래프 (시안 `주간` 988:2063 Group 160).
 * 막대 27폭 r8, baseline은 카드 하단에서 6. **오늘** 막대만 green-700, 나머지 green-200
 * (요일 라벨도 같은 규칙 — 사용자 결정). 높이는 y축 눈금 상한 기준 비례.
 */
export function WeeklyChart({ daily, today }: { daily: DailyDistance[]; today: string }) {
  const scaleMax = chartScaleMax(Math.max(...daily.map((d) => d.distanceKm), 0));

  return (
    <div data-testid="weekly-chart">
      <ChartCard scaleMax={scaleMax}>
        <div
          className="absolute inset-x-0 flex items-end justify-evenly px-[14px]"
          style={{ bottom: CHART_BASELINE }}
        >
          {daily.map((d) => (
            <span
              key={d.date}
              data-testid={`bar-${d.date}`}
              title={`${d.distanceKm}km`}
              className={`w-[27px] rounded-md ${
                d.date === today ? 'bg-green-700' : 'bg-green-200'
              }`}
              style={{ height: Math.round((d.distanceKm / scaleMax) * CHART_PLOT) }}
            />
          ))}
        </div>
      </ChartCard>

      {/* 요일 + 날짜 라벨 (시안 Frame 332) */}
      <ChartAxis>
        <div className="flex flex-1 justify-evenly px-[14px]">
          {daily.map((d) => {
            const date = new Date(`${d.date}T00:00:00`);
            const isToday = d.date === today;
            return (
              <span key={d.date} className="flex w-[27px] flex-col items-center gap-[5px]">
                <span className={`text-caption-tight ${isToday ? 'text-green-700' : 'text-black'}`}>
                  {DAY_LABELS[date.getDay()]}
                </span>
                <span className="text-overline text-gray-500">
                  {date.getMonth() + 1}/{date.getDate()}
                </span>
              </span>
            );
          })}
        </div>
      </ChartAxis>
    </div>
  );
}
