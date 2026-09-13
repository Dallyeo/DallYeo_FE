import IcChevron from '@/shared/ui/icons/ic-chevron-forward.svg?react';

/**
 * V11 기간 이동 (시안 `주간`/`월간`/`연간` 988:2063·2339·2194 Frame 358).
 * 좌우 30×30 화살표 + 가운데 라벨. 라벨 폭이 기간마다 달라(주간 139 / 월간 69 / 연간 45)
 * 화살표 간격이 함께 줄어드는 시안 그대로 — 컨테이너를 가운데 정렬하고 라벨을 자연폭으로 둔다.
 *
 * **미래 구간으로는 못 넘어간다**(`canGoNext=false`면 오른쪽 화살표 비활성) — 아직 오지 않은
 * 주/달/해는 항상 빈 화면이라 넘길 이유가 없다.
 */
export function PeriodNavigator({
  label,
  onPrev,
  onNext,
  canGoNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canGoNext: boolean;
}) {
  return (
    <div data-testid="period-nav" className="flex h-[30px] items-center justify-center">
      <Arrow direction="prev" onClick={onPrev} enabled />
      <span
        data-testid="period-nav-label"
        className="px-[3px] text-center text-body-sm text-gray-500"
      >
        {label}
      </span>
      <Arrow direction="next" onClick={onNext} enabled={canGoNext} />
    </div>
  );
}

function Arrow({
  direction,
  onClick,
  enabled,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  enabled: boolean;
}) {
  const isPrev = direction === 'prev';
  return (
    <button
      type="button"
      data-testid={`period-${direction}`}
      aria-label={isPrev ? '이전 기간' : '다음 기간'}
      onClick={onClick}
      disabled={!enabled}
      className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center ${
        enabled ? 'text-gray-500' : 'text-gray-250'
      }`}
    >
      <IcChevron aria-hidden className={`h-[11px] w-auto ${isPrev ? 'rotate-180' : ''}`} />
    </button>
  );
}
