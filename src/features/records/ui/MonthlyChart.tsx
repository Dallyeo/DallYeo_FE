import type { DailyDistance } from '@/domain/types';
import { chartScaleMax } from '@/domain/logic';
import { CHART_BASELINE, CHART_PLOT, ChartAxis, ChartCard } from './ChartCard';
import { smoothPath } from './smoothPath';

/** x축에 날짜를 적는 일자 (시안 Frame 352 — 1 . 7 . 14 . 21 . 28) */
const AXIS_DAYS = [1, 7, 14, 21, 28];

/**
 * V11 월간 꺾은선 그래프 (시안 `월간` 988:2339 Group 159).
 * 한 달치 일별 거리를 선으로 잇는다 — 막대 31개는 폭 10px 이하라 읽히지 않는다(시안도 선).
 *
 * 선은 시안처럼 **부드러운 곡선**이다 — 단조 3차 보간(`smoothPath`)이라 골짜기에서
 * baseline 아래로 출렁이지 않는다.
 *
 * SVG는 `preserveAspectRatio="none"`으로 가로를 늘려 쓰고, 선 굵기는
 * `vector-effect="non-scaling-stroke"`로 고정한다(안 그러면 가로 배율만큼 두꺼워진다).
 */
export function MonthlyChart({ daily, today }: { daily: DailyDistance[]; today: string }) {
  const scaleMax = chartScaleMax(Math.max(...daily.map((d) => d.distanceKm), 0));
  const last = daily.length - 1;
  const xOf = (i: number): number => (last > 0 ? (i / last) * 100 : 50);
  const yOf = (km: number): number => CHART_PLOT - (km / scaleMax) * CHART_PLOT;

  const path = smoothPath(
    daily.map((d) => d.distanceKm),
    xOf,
    yOf,
  );

  // 오늘이 이 달에 없으면(과거 달을 보는 중) 인디케이터도 없다
  const todayIndex = daily.findIndex((d) => d.date === today);
  const todayPoint = todayIndex >= 0 ? daily[todayIndex] : undefined;

  return (
    <div data-testid="monthly-chart">
      <ChartCard scaleMax={scaleMax}>
        <svg
          aria-hidden
          viewBox={`0 0 100 ${CHART_PLOT}`}
          preserveAspectRatio="none"
          className="absolute inset-x-0 w-full"
          style={{ bottom: CHART_BASELINE, height: CHART_PLOT }}
        >
          <path
            d={path}
            fill="none"
            stroke="var(--c-green-700)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {todayPoint && (
            // 오늘 지점에서 baseline까지 내리는 세로선 (시안 Frame 355 Vector 126)
            <line
              x1={xOf(todayIndex)}
              y1={yOf(todayPoint.distanceKm)}
              x2={xOf(todayIndex)}
              y2={CHART_PLOT}
              stroke="var(--c-green-700)"
              strokeWidth={1}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </ChartCard>

      {/* x축 — 고정 라벨(1·7·14·21·28) 위에 오늘 라벨을 겹쳐 올린다.
          겹쳐도 읽히도록 오늘 라벨에만 배경을 깔았다. */}
      <ChartAxis>
        <div className="relative flex-1">
          <div className="flex justify-between">
            {AXIS_DAYS.map((day, i) => (
              <span key={day} className="contents">
                {i > 0 && <Dot />}
                <span className="text-overline text-gray-900">{day}</span>
                {i < AXIS_DAYS.length - 1 && <Dot />}
              </span>
            ))}
          </div>
          {todayPoint && (
            <span
              data-testid="monthly-today-label"
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap bg-white px-[2px] text-caption-tight text-green-700"
              style={{ left: `${xOf(todayIndex)}%` }}
            >
              {new Date(`${todayPoint.date}T00:00:00`).getMonth() + 1}/
              {new Date(`${todayPoint.date}T00:00:00`).getDate()}
            </span>
          )}
        </div>
      </ChartAxis>
    </div>
  );
}

function Dot() {
  return (
    <span aria-hidden className="text-overline text-gray-500">
      .
    </span>
  );
}
