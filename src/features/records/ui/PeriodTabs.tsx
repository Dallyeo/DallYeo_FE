import { STATS_PERIODS, type StatsPeriod } from '@/domain/types';

/**
 * V11 기간 탭 (V11_기록_주간 682:1385 Frame 331).
 * 탭 60×38 · 간격 10(=인덱스당 70) · `text-label-sm`, 활성 green-700 / 비활성 gray-500.
 * 활성 밑줄은 시안 stroke를 슬라이딩 전환으로 구현. 시안의 '전체' 탭은 제거 확정.
 */
export function PeriodTabs({
  value,
  onChange,
}: {
  value: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
}) {
  const index = STATS_PERIODS.findIndex((p) => p.key === value);

  return (
    // 시안: 스트립 46 높이 (탭 38 + 위아래 4). 구분선은 아래에서 4 띄우고 좌우 19 인셋.
    <div className="relative h-[46px] pl-[15px] pt-1">
      <span aria-hidden className="absolute inset-x-[19px] bottom-1 border-b border-gray-250" />
      <div className="relative inline-flex gap-2.5" role="tablist">
        {STATS_PERIODS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={value === key}
            data-testid={`period-${key}`}
            onClick={() => onChange(key)}
            className={`h-[38px] w-[60px] text-label-sm transition-colors ${
              value === key ? 'text-green-700' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
        <span
          aria-hidden
          data-testid="period-underline"
          className="absolute bottom-0 left-0 h-[2px] w-[60px] rounded-sm bg-green-700 transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${index * 70}px)` }}
        />
      </div>
    </div>
  );
}
