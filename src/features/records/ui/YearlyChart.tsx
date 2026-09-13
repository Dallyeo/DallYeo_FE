import type { MonthlyDistance } from '@/domain/logic';
import { chartScaleMax } from '@/domain/logic';
import { CHART_BASELINE, CHART_PLOT, ChartAxis, ChartCard } from './ChartCard';

/** x축에 월을 적는 달 (시안 Frame 353 — 1월 · 6월 · 12월, 나머지는 점) */
const AXIS_MONTHS = [1, 6, 12];

/**
 * V11 연간 막대그래프 (시안 `연간` 988:2194 Frame 354).
 * 12칸 각 27폭, 막대는 10폭 r8. **이번 달** 막대만 green-700 (보고 있는 해가 올해일 때만).
 */
export function YearlyChart({
  monthly,
  currentMonth,
}: {
  monthly: MonthlyDistance[];
  /** 강조할 달(1~12). 보고 있는 해가 올해가 아니면 undefined */
  currentMonth?: number | undefined;
}) {
  const scaleMax = chartScaleMax(Math.max(...monthly.map((m) => m.distanceKm), 0));

  return (
    <div data-testid="yearly-chart">
      <ChartCard scaleMax={scaleMax}>
        <div
          className="absolute inset-x-0 flex items-end justify-evenly px-[8px]"
          style={{ bottom: CHART_BASELINE }}
        >
          {monthly.map((m) => (
            <span
              key={m.month}
              data-testid={`bar-month-${m.month}`}
              title={`${m.distanceKm}km`}
              className={`w-[10px] rounded-lg ${
                m.month === currentMonth ? 'bg-green-700' : 'bg-green-200'
              }`}
              style={{ height: Math.round((m.distanceKm / scaleMax) * CHART_PLOT) }}
            />
          ))}
        </div>
      </ChartCard>

      <ChartAxis>
        <div className="flex flex-1 justify-evenly px-[8px]">
          {monthly.map((m) => {
            const isCurrent = m.month === currentMonth;
            const labelled = isCurrent || AXIS_MONTHS.includes(m.month);
            return (
              <span
                key={m.month}
                className={`w-[27px] text-center ${
                  isCurrent
                    ? 'text-caption-tight text-green-700'
                    : `text-overline ${labelled ? 'text-gray-900' : 'text-gray-500'}`
                }`}
              >
                {labelled ? `${m.month}월` : '.'}
              </span>
            );
          })}
        </div>
      </ChartAxis>
    </div>
  );
}
