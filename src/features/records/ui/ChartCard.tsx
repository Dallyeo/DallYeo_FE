import type { ReactNode } from 'react';

/** 카드 높이 / 막대 baseline 여백 / 플롯 높이 — 시안 Group 158 실측 (195, 6, 154) */
export const CHART_HEIGHT = 195;
export const CHART_BASELINE = 6;
export const CHART_PLOT = 154;

/** 그리드선 y (카드 상단 기준). 위=눈금 상한, 아래=상한/2 */
const GRID_TOP = CHART_HEIGHT - CHART_BASELINE - CHART_PLOT; // 35
const GRID_MID = CHART_HEIGHT - CHART_BASELINE - CHART_PLOT / 2; // 112

/** 눈금 숫자는 정수면 정수로 (12.5 같은 값만 소수 한 자리) */
const tick = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/**
 * 기간 차트 공통 껍데기 — 카드 + 그리드선 2줄 + 좌측 y축 눈금 (시안 Group 158).
 *
 * ⚠️ 그리드선은 장식이 아니라 **눈금값**이다: 위 선이 `scaleMax`, 아래 선이 그 절반.
 * 그래서 막대·선 높이도 `scaleMax` 기준으로 그려야 눈금과 그림이 맞는다
 * (`chartScaleMax`가 최댓값을 1·2·5 계열로 올려 눈금이 정수로 떨어지게 한다).
 */
export function ChartCard({
  scaleMax,
  children,
  testId,
}: {
  scaleMax: number;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <div className="flex items-start">
      {/* y축 눈금 — 시안은 카드 왼쪽 바깥 21px 폭 */}
      <div
        aria-hidden
        className="relative h-[195px] w-[21px] shrink-0 text-overline text-gray-500"
        style={{ height: CHART_HEIGHT }}
      >
        <span className="absolute right-1" style={{ top: GRID_TOP - 6 }}>
          {tick(scaleMax)}
        </span>
        <span className="absolute right-1" style={{ top: GRID_MID - 6 }}>
          {tick(scaleMax / 2)}
        </span>
        <span className="absolute bottom-[6px] right-1">km</span>
      </div>

      <div
        data-testid={testId}
        className="relative min-w-0 flex-1 rounded-sm bg-off-white shadow-[0_0_4px_rgba(0,0,0,0.15)]"
        style={{ height: CHART_HEIGHT }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 border-t border-gray-250"
          style={{ top: GRID_TOP }}
        />
        <span
          aria-hidden
          className="absolute inset-x-0 border-t border-gray-250"
          style={{ top: GRID_MID }}
        />
        {children}
      </div>
    </div>
  );
}

/** 차트 바깥 x축 라벨 줄 — 카드 왼쪽 눈금 폭(21)만큼 들여써서 플롯과 열을 맞춘다 */
export function ChartAxis({ children }: { children: ReactNode }) {
  return <div className="mt-[10px] flex pl-[21px]">{children}</div>;
}
