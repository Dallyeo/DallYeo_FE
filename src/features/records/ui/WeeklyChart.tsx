import type { DailyDistance } from '@/domain/types';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * V11 주간 막대그래프 (V11_기록_주간 682:1385).
 * 카드 370×195 r6 + 그림자, 내부 그리드선 2줄. 막대 27폭 r8, baseline 카드 하단에서 6.
 * **오늘** 막대만 green-700, 나머지 green-200 (요일 라벨도 동일 규칙 — 사용자 결정).
 * 막대 높이는 구간 최대 거리를 기준으로 비례(최대 154px).
 */
export function WeeklyChart({ daily, today }: { daily: DailyDistance[]; today: string }) {
  const max = Math.max(...daily.map((d) => d.distanceKm), 0);

  return (
    <div data-testid="weekly-chart">
      {/* 차트 카드 — 막대는 카드 위에 겹쳐 그린다 */}
      <div className="relative h-[195px] rounded-sm bg-off-white shadow-[0px_0px_5.7px_rgba(0,0,0,0.15)]">
        {/* 그리드선 — 시안 T68 / T128 */}
        <span aria-hidden className="absolute inset-x-0 top-[68px] border-t border-gray-250" />
        <span aria-hidden className="absolute inset-x-0 top-[128px] border-t border-gray-250" />

        <div className="absolute inset-x-0 bottom-[6px] flex items-end justify-evenly px-[30px]">
          {daily.map((d) => {
            const isToday = d.date === today;
            const height = max > 0 ? Math.round((d.distanceKm / max) * 154) : 0;
            return (
              <span
                key={d.date}
                data-testid={`bar-${d.date}`}
                title={`${d.distanceKm}km`}
                className={`w-[27px] rounded-md ${isToday ? 'bg-green-700' : 'bg-green-200'}`}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* 요일 + 날짜 라벨 — 시안 간격 20 */}
      <div className="mt-[10px] flex justify-evenly px-[30px]">
        {daily.map((d) => {
          const date = new Date(`${d.date}T00:00:00`);
          const isToday = d.date === today;
          return (
            <span key={d.date} className="flex w-[27px] flex-col items-center gap-[5px]">
              <span
                className={`text-caption-tight ${isToday ? 'text-green-700' : 'text-black'}`}
              >
                {DAY_LABELS[date.getDay()]}
              </span>
              <span className="text-overline text-gray-500">
                {date.getMonth() + 1}/{date.getDate()}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
